from django.db import models


class Character(models.Model):
    # Basic data
    name = models.CharField(max_length=255)
    nickname = models.CharField(max_length=255, blank=True, null=True)
    char_class = models.CharField(max_length=100, blank=True, null=True)
    secondary_class = models.CharField(max_length=100, blank=True, null=True)
    race = models.CharField(max_length=100, blank=True, null=True)
    alignment = models.CharField(max_length=100, blank=True, null=True)

    visible = models.BooleanField(default=False)
    npc = models.BooleanField(default=False)

    level = models.IntegerField(default=1)
    experience = models.IntegerField(default=0)

    # Core attributes
    strength = models.IntegerField(default=10)
    dexterity = models.IntegerField(default=10)
    constitution = models.IntegerField(default=10)
    intelligence = models.IntegerField(default=10)
    wisdom = models.IntegerField(default=10)
    charisma = models.IntegerField(default=10)

    # Resources
    hp = models.IntegerField(default=10)
    max_hp = models.IntegerField(default=10)
    energy = models.IntegerField(default=0)

    # Coins
    copper = models.IntegerField(default=0)
    silver = models.IntegerField(default=0)
    gold = models.IntegerField(default=0)
    platinum = models.IntegerField(default=0)

    # Background
    background_story = models.TextField(max_length=1000, blank=True, null=True)
    motivations = models.TextField(max_length=500, blank=True, null=True)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.char_class})"


class Spell(models.Model):
    character = models.ForeignKey(
        Character, on_delete=models.CASCADE, related_name="spells"
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    level = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Item(models.Model):
    character = models.ForeignKey(
        Character, on_delete=models.CASCADE, related_name="items"
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    quantity = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Condition(models.Model):
    character = models.ForeignKey(
        Character, on_delete=models.CASCADE, related_name="conditions"
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class InventoryItem(models.Model):
    character = models.ForeignKey(
        Character, on_delete=models.CASCADE, related_name="inventory"
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    weight = models.FloatField(default=0.0)
    quantity = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
