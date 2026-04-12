import uuid
from datetime import timedelta
from io import BytesIO

from django.contrib.auth.models import User
from django.core.files.base import ContentFile
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from PIL import Image


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
    image = models.ImageField(upload_to="characters/avatars/", null=True, blank=True)

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

    def save(self, *args, **kwargs):
        # Image optimization logic
        if self.image:
            try:
                # Check if the image has changed by checking if it's a file object being assigned
                # or if it's already a saved path string.
                # If it's a file object (e.g. from a form upload), it will have an 'file' attribute or similar
                # depending on the storage. A simple way is to check if it's an instance of UploadedFile
                # but models shouldn't necessarily know about UploadedFile.
                # Here we check if the file is currently 'open' or has no '.' in path if name is new.
                # Actually, a common pattern is to check if it hasn't been saved yet.
                is_new_image = False
                try:
                    # If it's newly uploaded, accessing .file might work or it might be raw
                    if hasattr(self.image.file, "name") or self.image.file:
                        # Simple check: if the extension is not .webp, we definitely want to process it
                        # or if it is newly uploaded.
                        if not self.image.name.lower().endswith(".webp"):
                            is_new_image = True
                except (ValueError, AttributeError):
                    pass

                if is_new_image:
                    img = Image.open(self.image)
                    img = img.convert("RGB")  # Ensure we can save as WebP/JPEG

                    # 1. Square crop (center)
                    width, height = img.size
                    if width != height:
                        min_dim = min(width, height)
                        left = (width - min_dim) / 2
                        top = (height - min_dim) / 2
                        right = (width + min_dim) / 2
                        bottom = (height + min_dim) / 2
                        img = img.crop((left, top, right, bottom))

                    # 2. Resize to 512x512 max
                    if img.width > 512 or img.height > 512:
                        img.thumbnail((512, 512), Image.Resampling.LANCZOS)

                    # 3. Save as WebP
                    output = BytesIO()
                    img.save(output, format="WebP", quality=85)
                    output.seek(0)

                    # Update the image field with the new processed file
                    new_name = f"{uuid.uuid4().hex}.webp"
                    self.image = ContentFile(output.read(), name=new_name)

            except Exception as e:
                # We don't want to crash the whole save if image processing fails,
                # but we should log it.
                print(f"Error processing character image: {e}")

        super().save(*args, **kwargs)


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


class VoiceProfile(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="voice_profiles"
    )
    character = models.ForeignKey(
        Character,
        on_delete=models.CASCADE,
        related_name="voice_profiles",
        null=True,
        blank=True,
    )
    # 128-d embedding stored as a list of floats
    embedding = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        owner = self.character.name if self.character else "DM/Narrador"
        return f"Voice Profile: {owner} ({self.user.username})"


class ChronicleSession(models.Model):
    STATUS_CHOICES = [
        ("WAITING", "Esperando"),
        ("TRANSCRIBING", "Transcribiendo..."),
        ("SUMMARIZING", "Resumiendo..."),
        ("PAUSED", "Pausado"),
        ("COMPLETED", "Completado"),
    ]
    date = models.DateField(default=timezone.now)
    title = models.CharField(max_length=255, blank=True, null=True)
    # List of audio file paths
    audio_files = models.JSONField(default=list)
    summary = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="WAITING")
    celery_task_id = models.CharField(max_length=255, blank=True, null=True)
    last_processed_timestamp = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Chronicle Session - {self.date}"


class TranscriptionFragment(models.Model):
    session = models.ForeignKey(
        ChronicleSession, on_delete=models.CASCADE, related_name="fragments"
    )
    text = models.TextField()
    timestamp = models.FloatField()
    character = models.ForeignKey(
        Character, on_delete=models.SET_NULL, null=True, blank=True
    )
    is_dm = models.BooleanField(default=False)

    class Meta:
        ordering = ["timestamp"]

    def __str__(self):
        speaker = (
            self.character.name
            if self.character
            else ("DM" if self.is_dm else "Unknown")
        )
        return f"[{self.timestamp}] {speaker}: {self.text[:30]}"
