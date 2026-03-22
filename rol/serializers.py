from rest_framework import serializers

from .models import Character, Condition, InventoryItem, Item, Spell


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
