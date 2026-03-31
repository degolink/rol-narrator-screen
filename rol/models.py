import uuid
from datetime import timedelta

from django.contrib.auth.models import User
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone


class Character(models.Model):
    player = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="characters", null=True, blank=True
    )
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


class ChatMessage(models.Model):
    MESSAGE_TYPES = (
        ("IC", "In Character"),
        ("OOC", "Out of Character"),
        ("WHISPER", "Whisper"),
    )

    sender_user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="sent_messages"
    )
    sender_character = models.ForeignKey(
        Character,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="chat_messages",
    )
    recipient_user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="received_whispers",
    )
    content = models.TextField()
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPES, default="IC")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        sender = (
            self.sender_character.name
            if self.sender_character
            else self.sender_user.username
        )
        return f"[{self.message_type}] {sender}: {self.content[:20]}"


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    is_dungeon_master = models.BooleanField(default=False)
    active_character = models.ForeignKey(
        Character,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="active_profiles",
    )

    def __str__(self):
        return f"Profile of {self.user.username}"


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.get_or_create(user=instance)


class MagicToken(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="magic_tokens"
    )
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(minutes=15)
        super().save(*args, **kwargs)

    def is_valid(self):
        return timezone.now() < self.expires_at

    def __str__(self):
        return f"Token for {self.user.email} (valid until {self.expires_at})"
