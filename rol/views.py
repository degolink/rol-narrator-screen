from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Character
from .serializers import CharacterSerializer


class CharacterViewSet(viewsets.ModelViewSet):
    queryset = Character.objects.all().order_by("-created_at")
    serializer_class = CharacterSerializer

    @action(detail=True, methods=["post"])
    def coin(self, request, pk=None):
        """
        Updates the coin amounts for a character.
        Expected JSON: {"type": "copper|silver|gold|platinum", "value": int}
        """
        character = self.get_object()

        coin_type = request.data.get("type", "").lower()
        value = request.data.get("value")

        if value is None or not isinstance(value, int) or value < 0:
            value = 0

        if coin_type == "copper":
            character.copper = value
        elif coin_type == "silver":
            character.silver = value
        elif coin_type == "gold":
            character.gold = value
        elif coin_type == "platinum":
            character.platinum = value
        else:
            return Response(
                {
                    "detail": "Unknown coin type. Must be copper, silver, gold, or platinum."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        character.save()
        serializer = self.get_serializer(character)
        return Response(serializer.data)
