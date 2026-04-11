import os
import traceback

import numpy as np
import torch
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.conf import settings
from django.contrib.auth import login
from django.contrib.auth.models import User
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.core.mail import send_mail
from django.db.models import Q
from django.utils import timezone
from pydub import AudioSegment
from rest_framework import filters, pagination, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from speechbrain.inference import EncoderClassifier

from rol_narrator_screen.celery import app as celery_app

from .models import (
    Character,
    ChatMessage,
    ChronicleSession,
    MagicToken,
    UserProfile,
    VoiceProfile,
)
from .serializers import (
    CharacterSerializer,
    ChatMessageSerializer,
    ChronicleSessionSerializer,
    UserSerializer,
)
from .tasks import process_chronicler_session


class CharacterPermissions(IsAuthenticated):
    def has_object_permission(self, request, view, obj):
        # Read permissions are handled by get_queryset
        if request.method in ["GET", "HEAD", "OPTIONS"]:
            return True

        is_dm = UserProfile.objects.filter(
            user=request.user, is_dungeon_master=True
        ).exists()
        # print(f"DEBUG: User={request.user.username}, is_dm={is_dm}, method={request.method}", flush=True)
        if is_dm:
            return True

        # Regular users can only update visible main characters
        if request.method in ["PUT", "PATCH"]:
            return obj.visible and not obj.npc

        # Regular users cannot delete or perform other actions
        return False


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

            response = Response(
                {
                    "user": UserSerializer(user).data,
                }
            )

            # Set JWT cookies if enabled in settings
            if settings.REST_AUTH.get("USE_JWT", False):
                from dj_rest_auth.jwt_auth import set_jwt_cookies

                set_jwt_cookies(response, refresh.access_token, refresh)

            return response
        except MagicToken.DoesNotExist:
            return Response(
                {"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST
            )


class ProfileViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    queryset = User.objects.none()

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
                new_status = request.data["is_dungeon_master"]
                if new_status != profile.is_dungeon_master:
                    # Clear characters on any role change
                    Character.objects.filter(player=user).update(player=None)
                profile.is_dungeon_master = new_status
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
            # Detailed profile Update for the user only
            user_group = f"user_{user.id}"
            async_to_sync(channel_layer.group_send)(
                user_group,
                {
                    "type": "profile_update_event",
                    "data": UserSerializer(user).data,
                },
            )

        serializer = self.get_serializer(user)
        return Response(serializer.data)

    @action(detail=False, methods=["post"])
    def assign_character(self, request):
        """Assigns or unassigns a character to the current user."""
        character_id = request.data.get("character_id")
        if not character_id:
            return Response(
                {"error": "Character ID is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            character = Character.objects.get(id=character_id)
            user = request.user
            previous_player = character.player

            if character.player == user:
                character.player = None
                assign_action = "unassigned"
            else:
                # One character per user restriction
                is_dm = UserProfile.objects.filter(
                    user=user, is_dungeon_master=True
                ).exists()
                if not is_dm and Character.objects.filter(player=user).exists():
                    return Response(
                        {
                            "error": "Ya tienes un personaje asignado. Libéralo o cámbialo en tu perfil."
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                character.player = user
                assign_action = "assigned"

            character.save()

            # 1. Handle exclusivity: If stolen, clear previous owner's active status
            if previous_player and previous_player != user:
                self._handle_stolen_character(previous_player, character)

            # 2. Handle auto-selection and cleanup for the current user
            self._sync_user_active_character(user, character, assign_action)

            # 3. Create and broadcast announcement message in chat
            self._announce_character_change(
                user, character, previous_player, assign_action
            )

            # 4. Trigger global refresh of character lists
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                "global_chat", {"type": "character_list_update"}
            )

            # Broadcast update to current user (Profile sync)
            self._broadcast_profile_update(user, force_refresh=True)

            return Response(
                {"message": f"Character {character.name} {assign_action} successfully"}
            )
        except Character.DoesNotExist:
            return Response(
                {"error": "Character not found"}, status=status.HTTP_404_NOT_FOUND
            )

    def _handle_stolen_character(self, previous_player, character):
        """Clears the active character from a player if it was stolen from them."""
        prev_profile, _ = UserProfile.objects.get_or_create(user=previous_player)
        if prev_profile.active_character == character:
            prev_profile.active_character = None
            prev_profile.save()
            self._broadcast_profile_update(
                previous_player,
                notification=f"El personaje {character.name} ha sido reclamado por otro jugador.",
                force_refresh=True,
            )
        else:
            # Still need to refresh their list as they lost access
            self._broadcast_profile_update(previous_player, force_refresh=True)

    def _sync_user_active_character(self, user, character, action):
        """Synchronizes the active character for the current user after assignment change."""
        profile, _ = UserProfile.objects.get_or_create(user=user)

        # If the character being unassigned was the active one, clear it
        if action == "unassigned" and profile.active_character == character:
            profile.active_character = None
            profile.save()

        # Ensure current active character (if any) is still valid
        if profile.active_character:
            is_invalid = False
            if profile.is_dungeon_master:
                if not profile.active_character.visible:
                    is_invalid = True
            elif profile.active_character.player != user:
                is_invalid = True

            if is_invalid:
                profile.active_character = None
                profile.save()

        # Auto-selection: If user has exactly one character now, select it
        my_chars = Character.objects.filter(player=user, is_active=True)
        if (
            action == "assigned"
            and my_chars.count() == 1
            and not profile.active_character
        ):
            profile.active_character = my_chars.first()
            profile.save()

    def _announce_character_change(self, user, character, previous_player, action):
        """Creates and broadcasts a system message about the character assignment change."""
        if action == "assigned":
            if previous_player and previous_player != user:
                announcement = (
                    f"**{user.username}** ha **ARREBATADO** el personaje "
                    f"**{character.name}** a **{previous_player.username}**."
                )
            else:
                announcement = (
                    f"**{user.username}** ha **RECLAMADO** el personaje "
                    f"**{character.name}**."
                )
        else:
            announcement = (
                f"**{user.username}** ha **LIBERADO** el personaje "
                f"**{character.name}**."
            )

        system_msg = ChatMessage.objects.create(
            sender_user=user,
            content=announcement,
            message_type="OOC",
        )

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "global_chat",
            {
                "type": "chat_message_event",
                "message": ChatMessageSerializer(system_msg).data,
            },
        )

    @action(detail=False, methods=["post"])
    def set_active_character(self, request):
        character_id = request.data.get("character_id")
        user = request.user
        profile, _ = UserProfile.objects.get_or_create(user=user)

        if character_id is None:
            profile.active_character = None
            profile.save()
            # Broadcast update
            self._broadcast_profile_update(user)
            return Response({"message": "Active character cleared"})

        try:
            character = Character.objects.get(id=character_id)
            # Check permissions:
            # DM can select anyone visible. Player can select only their assigned ones.
            if profile.is_dungeon_master:
                if not character.visible:
                    return Response(
                        {"error": "NPC not visible"}, status=status.HTTP_403_FORBIDDEN
                    )
            else:
                if character.player != user:
                    return Response(
                        {"error": "This character is not yours"},
                        status=status.HTTP_403_FORBIDDEN,
                    )

            profile.active_character = character
            profile.save()

            # Broadcast update
            self._broadcast_profile_update(user)

            return Response(
                {
                    "message": f"Active character set to {character.name}",
                    "active_character": CharacterSerializer(character).data,
                }
            )
        except Character.DoesNotExist:
            return Response(
                {"error": "Character not found"}, status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=["get"])
    def participants(self, request):
        users = User.objects.all().select_related(
            "profile", "profile__active_character"
        )
        data = []
        for u in users:
            profile = getattr(u, "profile", None)
            active_char = profile.active_character if profile else None

            # Determine "display name" for whisper list
            if profile and profile.is_dungeon_master:
                display_name = "Dungeon Master"
            elif active_char:
                display_name = active_char.name
            else:
                display_name = u.username

            data.append(
                {
                    "id": u.id,
                    "username": u.username,
                    "display_name": display_name,
                    "is_dm": profile.is_dungeon_master if profile else False,
                    "active_character_id": active_char.id if active_char else None,
                    "image": request.build_absolute_uri(active_char.image.url)
                    if active_char and active_char.image
                    else None,
                }
            )
        return Response(data)

    @action(detail=False, methods=["post"])
    def enroll_voice(self, request):
        """Enrolls a user's voice by extracting speaker embeddings."""
        audio_file = request.FILES.get("audio")
        if not audio_file:
            return Response(
                {"error": "Se requiere un archivo de audio."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = request.user
        # Save temp file
        temp_path = os.path.join(settings.MEDIA_ROOT, f"temp/enroll_{user.id}.wav")
        os.makedirs(os.path.dirname(temp_path), exist_ok=True)

        # Efficiently save file to disk in chunks to manage RAM usage
        with open(temp_path, "wb") as f:
            for chunk in audio_file.chunks():
                f.write(chunk)

        try:
            # Normalize audio (16kHz, mono) using pydub
            audio = AudioSegment.from_file(temp_path)
            audio = audio.set_frame_rate(16000).set_channels(1)
            audio.export(temp_path, format="wav")

            # Load SpeechBrain model
            model_dir = os.path.join(settings.MEDIA_ROOT, "models/speechbrain")
            os.makedirs(model_dir, exist_ok=True)
            classifier = EncoderClassifier.from_hparams(
                source="speechbrain/spkrec-ecapa-voxceleb",
                savedir=model_dir,
                run_opts={"device": "cpu"},
            )

            # Extract signal from pydub for SpeechBrain
            samples = np.array(audio.get_array_of_samples()).astype(np.float32)
            # Normalize to [-1, 1] for 16-bit PCM
            if audio.sample_width == 2:
                samples /= 32768.0

            # Convert to PyTorch Tensor and add batch dimension [1, sequence_length]
            signal = torch.from_numpy(samples).unsqueeze(0)

            # Extract embedding using SpeechBrain
            embeddings = classifier.encode_batch(signal)
            # Flatten tensor dimensions and convert to standard Python list for DB storage
            embedding_list = embeddings.squeeze().tolist()

            # Save to Profile (Overwrite if exists)
            VoiceProfile.objects.update_or_create(
                user=user, defaults={"embedding": embedding_list}
            )

            # Also save sample for training/debugging if requested
            sample_dir = os.path.join(settings.MEDIA_ROOT, "voice_samples")
            os.makedirs(sample_dir, exist_ok=True)
            sample_path = os.path.join(sample_dir, f"user_{user.id}_sample.wav")
            audio.export(sample_path, format="wav")

            # Refetch user to include new voice profile in response
            serializer = self.get_serializer(user)
            return Response(serializer.data)

        except Exception as e:
            traceback.print_exc()
            return Response(
                {"error": f"Error al procesar la voz: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

    def _broadcast_profile_update(self, user, notification=None, force_refresh=False):
        channel_layer = get_channel_layer()
        data = UserSerializer(user).data
        event = {
            "type": "profile_update_event",
            "data": data,
        }
        if notification:
            event["notification"] = notification
        if force_refresh:
            event["force_refresh"] = force_refresh

        async_to_sync(channel_layer.group_send)(
            f"user_{user.id}",
            event,
        )


class CharacterViewSet(viewsets.ModelViewSet):
    queryset = Character.objects.none()
    serializer_class = CharacterSerializer
    permission_classes = [CharacterPermissions]

    def perform_update(self, serializer):
        user = self.request.user
        is_dm = UserProfile.objects.filter(user=user, is_dungeon_master=True).exists()

        # Securing Visibility: Only DM can change 'visible'
        if "visible" in serializer.validated_data and not is_dm:
            serializer.validated_data.pop("visible")

        serializer.save()

    def get_queryset(self):
        user = self.request.user
        is_dm = UserProfile.objects.filter(user=user, is_dungeon_master=True).exists()

        if is_dm:
            queryset = Character.objects.all()
        else:
            # Regular users ONLY see visible characters, period.
            queryset = Character.objects.filter(visible=True)

        # Apply additional visibility filter if requested (DMs only or narrowing down)
        visible_only = self.request.query_params.get("visible", None)
        if visible_only is not None:
            if visible_only.lower() == "true":
                queryset = queryset.filter(visible=True)
            elif visible_only.lower() == "false" and is_dm:
                queryset = queryset.filter(visible=False)
            elif visible_only.lower() == "false":
                # Regular user asking for invisible characters gets nothing
                queryset = queryset.none()

        return queryset.order_by("-visible", "name")

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


class ChroniclerViewSet(viewsets.ModelViewSet):
    queryset = ChronicleSession.objects.all().order_by("-date")
    serializer_class = ChronicleSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        is_dm = UserProfile.objects.filter(user=user, is_dungeon_master=True).exists()
        
        if is_dm:
            return ChronicleSession.objects.all().order_by("-date")
        else:
            # Regular users only see completed chronicles
            return ChronicleSession.objects.filter(status="COMPLETED").order_by("-date")

    @action(detail=True, methods=["post"])
    def process(self, request, pk=None):
        session = self.get_object()
        if session.status in ["TRANSCRIBING", "SUMMARIZING"]:
            return Response(
                {"error": "Ya se está procesando esta sesión."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        task = process_chronicler_session.delay(session.id)
        session.celery_task_id = task.id
        session.status = "TRANSCRIBING"
        session.save()

        return Response({"message": "Procesamiento iniciado", "task_id": task.id})

    @action(detail=True, methods=["post"])
    def stop(self, request, pk=None):
        session = self.get_object()
        if not session.celery_task_id:
            return Response(
                {"error": "No hay una tarea activa para detener."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Revoke current task
        celery_app.control.revoke(session.celery_task_id, terminate=True)

        session.celery_task_id = None
        session.status = "PAUSED"
        session.save()

        return Response({"message": "Procesamiento detenido"})

    # Alias postpone to stop for compatibility during transition
    @action(detail=True, methods=["post"])
    def postpone(self, request, pk=None):
        return self.stop(request, pk)
