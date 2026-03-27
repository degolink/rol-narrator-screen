from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.conf import settings
from django.contrib.auth import login
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.db.models import Q
from django.utils import timezone
from rest_framework import filters, pagination, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Character, ChatMessage, MagicToken, UserProfile
from .serializers import CharacterSerializer, ChatMessageSerializer, UserSerializer


class RequestMagicLinkView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        username = request.data.get("username")

        if not email:
            return Response(
                {"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.filter(email=email).first()

        if not user:
            if not username:
                return Response(
                    {
                        "error": "User does not exist. Please provide a username to create an account.",
                        "code": "USER_NOT_FOUND",
                    },
                    status=status.HTTP_404_NOT_FOUND,
                )

            if User.objects.filter(username=username).exists():
                return Response(
                    {"error": "Username already taken"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            user = User.objects.create_user(username=username, email=email)
            # UserProfile is created via signal

        # Ensure profile exists
        UserProfile.objects.get_or_create(user=user)

        # Create token
        token = MagicToken.objects.create(user=user)

        frontend_url = settings.FRONTEND_URL
        login_url = f"{frontend_url}/verify?token={token.token}"

        # Send actual email
        subject = "Tu Enlace Mágico para Pantalla de Narrador"
        message = f"Haz clic en el siguiente enlace para iniciar sesión: {login_url}\n\nEste enlace expirará en 15 minutos."

        try:
            send_mail(
                subject,
                message,
                None,  # Uses DEFAULT_FROM_EMAIL
                [email],
                fail_silently=False,
            )
        except Exception as e:
            print(f"Error sending email: {e}", flush=True)

        return Response({"message": "Magic link sent! Check your inbox"})


class VerifyMagicLinkView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        token_uuid = request.query_params.get("token")
        if not token_uuid:
            return Response(
                {"error": "Token is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            token = MagicToken.objects.get(token=token_uuid)
            if not token.is_valid():
                return Response(
                    {"error": "Token expired"}, status=status.HTTP_400_BAD_REQUEST
                )

            user = token.user
            # Generate JWT
            refresh = RefreshToken.for_user(user)

            # Delete token after use
            token.delete()

            return Response(
                {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                    "user": UserSerializer(user).data,
                }
            )
        except MagicToken.DoesNotExist:
            return Response(
                {"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST
            )


class ProfileViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    @action(detail=False, methods=["get", "patch"])
    def me(self, request):
        user = request.user
        if request.method == "PATCH":
            # Update User fields
            if "username" in request.data:
                user.username = request.data["username"]
            if "email" in request.data:
                user.email = request.data["email"]
            if "first_name" in request.data:
                user.first_name = request.data["first_name"]
            user.save()

            # Update Profile fields
            profile, _ = UserProfile.objects.get_or_create(user=user)
            if "is_dungeon_master" in request.data:
                profile.is_dungeon_master = request.data["is_dungeon_master"]
                profile.save()

            # Broadcast update to chat
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                "global_chat",
                {
                    "type": "user_update_event",
                    "user_id": user.id,
                    "username": user.username,
                    "is_dungeon_master": profile.is_dungeon_master,
                },
            )

        serializer = self.get_serializer(user)
        return Response(serializer.data)

    @action(detail=False, methods=["post"])
    def assign_character(self, request):
        character_id = request.data.get("character_id")
        if not character_id:
            return Response(
                {"error": "Character ID is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            character = Character.objects.get(id=character_id)
            character.player = request.user
            character.save()
            return Response(
                {"message": f"Character {character.name} assigned successfully"}
            )
        except Character.DoesNotExist:
            return Response(
                {"error": "Character not found"}, status=status.HTTP_404_NOT_FOUND
            )


class CharacterViewSet(viewsets.ModelViewSet):
    queryset = Character.objects.none()
    serializer_class = CharacterSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Character.objects.all().order_by("-created_at")
        visible_only = self.request.query_params.get("visible", None)
        if visible_only is not None:
            if visible_only.lower() == "true":
                queryset = queryset.filter(visible=True)
            elif visible_only.lower() == "false":
                queryset = queryset.filter(visible=False)
        return queryset

    @action(detail=False, methods=["get"])
    def my_characters(self, request):
        characters = Character.objects.filter(player=request.user, is_active=True)
        serializer = self.get_serializer(characters, many=True)
        return Response(serializer.data)


class ChatMessagePagination(pagination.CursorPagination):
    page_size = 30
    ordering = "-created_at"


class ChatMessageViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ChatMessageSerializer
    pagination_class = ChatMessagePagination
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ["content", "sender_character__name"]

    def get_queryset(self):
        user = self.request.user
        return ChatMessage.objects.filter(
            Q(message_type__in=["IC", "OOC"])
            | Q(message_type="WHISPER", sender_user=user)
            | Q(message_type="WHISPER", recipient_user=user)
        )
