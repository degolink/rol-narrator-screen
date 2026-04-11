from django.contrib.auth.models import User
from rest_framework import serializers

from .models import (
    Character,
    ChatMessage,
    ChronicleSession,
    Condition,
    InventoryItem,
    Item,
    MagicToken,
    Spell,
    TranscriptionFragment,
    UserProfile,
    VoiceProfile,
)


class TranscriptionFragmentSerializer(serializers.ModelSerializer):
    character_name = serializers.ReadOnlyField(source="character.name")

    class Meta:
        model = TranscriptionFragment
        fields = ["id", "text", "timestamp", "character", "character_name", "is_dm"]


class ChronicleSessionSerializer(serializers.ModelSerializer):
    fragments = TranscriptionFragmentSerializer(many=True, read_only=True)

    class Meta:
        model = ChronicleSession
        fields = [
            "id",
            "date",
            "audio_files",
            "summary",
            "status",
            "last_processed_timestamp",
            "created_at",
            "fragments",
        ]


class VoiceProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = VoiceProfile
        fields = ["id", "created_at"]


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ["is_dungeon_master", "active_character"]


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    voice_profiles = VoiceProfileSerializer(many=True, read_only=True)
    assigned_characters_count = serializers.SerializerMethodField()
    first_character_id = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "profile",
            "voice_profiles",
            "assigned_characters_count",
            "first_character_id",
        ]

    def get_assigned_characters_count(self, obj):
        return obj.characters.filter(is_active=True).count()

    def get_first_character_id(self, obj):
        first = obj.characters.filter(is_active=True).first()
        return first.id if first else None


class SpellSerializer(serializers.ModelSerializer):
    class Meta:
        model = Spell
        fields = "__all__"


class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = "__all__"


class ConditionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Condition
        fields = "__all__"


class InventoryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryItem
        fields = "__all__"


class CharacterSerializer(serializers.ModelSerializer):
    spells = SpellSerializer(many=True, read_only=True)
    items = ItemSerializer(many=True, read_only=True)
    conditions = ConditionSerializer(many=True, read_only=True)
    inventory = InventoryItemSerializer(many=True, read_only=True)

    class Meta:
        model = Character
        fields = "__all__"

    def validate(self, data):
        # Determine if it's an NPC from data or instance
        is_npc = data.get("npc", getattr(self.instance, "npc", False))

        if not is_npc:
            # For non-NPCs, these fields are required
            required_fields = ["char_class", "race", "alignment"]
            errors = {}
            for field in required_fields:
                if not data.get(field) and not getattr(self.instance, field, None):
                    errors[field] = (
                        "Este campo es requerido para personajes principales."
                    )
            if errors:
                raise serializers.ValidationError(errors)

        return data


class ChatMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    sender_username = serializers.CharField(
        source="sender_user.username", read_only=True
    )
    is_sender_dm = serializers.BooleanField(
        source="sender_user.profile.is_dungeon_master", read_only=True
    )
    sender_char_id = serializers.ReadOnlyField(source="sender_character_id")

    class Meta:
        model = ChatMessage
        fields = [
            "id",
            "sender_user",
            "sender_username",
            "is_sender_dm",
            "sender_character",
            "sender_name",
            "sender_char_id",
            "recipient_user",
            "content",
            "message_type",
            "created_at",
        ]

    def get_sender_name(self, obj):
        if obj.sender_character:
            return obj.sender_character.name
        return (
            obj.sender_user.username or obj.sender_user.first_name or "Dungeon Master"
        )
