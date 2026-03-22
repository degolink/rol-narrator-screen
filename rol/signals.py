from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Character


@receiver(post_save, sender=Character)
def broadcast_character_update(sender, instance, created, **kwargs):
    # We import the serializer inside the function to avoid circular imports during startup
    from .serializers import CharacterSerializer

    channel_layer = get_channel_layer()
    data = CharacterSerializer(instance).data

    # Broadcast to the specific character group
    room_group_name = f"character_{instance.id}"
    async_to_sync(channel_layer.group_send)(
        room_group_name, {"type": "character_update", "data": data}
    )

    # broadcast to an "all" group
    async_to_sync(channel_layer.group_send)(
        "character_all", {"type": "character_update", "data": data}
    )
