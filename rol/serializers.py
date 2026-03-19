from rest_framework import serializers
from .models import Character, Spell, Item, Condition, InventoryItem

class SpellSerializer(serializers.ModelSerializer):
    class Meta:
        model = Spell
        fields = '__all__'

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = '__all__'

class ConditionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Condition
        fields = '__all__'

class InventoryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryItem
        fields = '__all__'

class CharacterSerializer(serializers.ModelSerializer):
    spells = SpellSerializer(many=True, read_only=True)
    items = ItemSerializer(many=True, read_only=True)
    conditions = ConditionSerializer(many=True, read_only=True)
    inventory = InventoryItemSerializer(many=True, read_only=True)

    class Meta:
        model = Character
        fields = '__all__'
