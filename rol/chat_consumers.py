import json

from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import User

from .models import Character, ChatMessage


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        if not self.user.is_authenticated:
            await self.close()
            return

        self.global_group = "global_chat"
        self.user_group = f"user_{self.user.id}"

        # Join global group
        await self.channel_layer.group_add(self.global_group, self.channel_name)
        # Join private group
        await self.channel_layer.group_add(self.user_group, self.channel_name)

        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "global_group"):
            await self.channel_layer.group_discard(self.global_group, self.channel_name)
        if hasattr(self, "user_group"):
            await self.channel_layer.group_discard(self.user_group, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        msg_type = data.get("type")

        if msg_type == "chat_message":
            content = data.get("content")
            char_id = data.get("character_id")
            recipient_id = data.get("recipient_id")
            ooc = data.get("ooc", False)

            message_category = "IC"
            if ooc:
                message_category = "OOC"
            elif recipient_id:
                message_category = "WHISPER"

            # Save to DB
            message = await self.save_message(
                self.user, char_id, recipient_id, content, message_category
            )

            # Prepare broadcast data
            broadcast_data = {
                "type": "chat_message_event",
                "message": {
                    "id": message.id,
                    "content": message.content,
                    "message_type": message.message_type,
                    "sender_name": message.sender_character.name
                    if message.sender_character
                    else (self.user.username or "Jugador"),
                    "sender_user_id": message.sender_user.id,
                    "recipient_user_id": message.recipient_user.id
                    if message.recipient_user
                    else None,
                    "created_at": message.created_at.isoformat(),
                },
            }

            if message_category == "WHISPER" and recipient_id:
                # Send to sender and recipient only
                await self.channel_layer.group_send(
                    f"user_{recipient_id}", broadcast_data
                )
                await self.channel_layer.group_send(self.user_group, broadcast_data)
            else:
                # Send to global group
                await self.channel_layer.group_send(self.global_group, broadcast_data)

        elif msg_type == "typing_indicator":
            # Use character name or username, fallback to "Dungeon Master" only if no other option
            char_name = data.get("character_name")
            if not char_name:
                char_name = self.user.username or "Dungeon Master"
            
            is_typing = data.get("is_typing", False)

            await self.channel_layer.group_send(
                self.global_group,
                {
                    "type": "typing_event",
                    "character_name": char_name,
                    "is_typing": is_typing,
                    "user_id": self.user.id,
                },
            )

    async def chat_message_event(self, event):
        await self.send(text_data=json.dumps(event))

    async def user_update_event(self, event):
        await self.send(text_data=json.dumps(event))

    async def typing_event(self, event):

        # Don't send typing indicator back to the sender
        if event["user_id"] != self.user.id:
            await self.send(text_data=json.dumps(event))

    @sync_to_async
    def save_message(self, user, char_id, recipient_id, content, category):
        character = None
        if char_id:
            character = Character.objects.filter(id=char_id, player=user).first()

        recipient = None
        if recipient_id:
            recipient = User.objects.filter(id=recipient_id).first()

        return ChatMessage.objects.create(
            sender_user=user,
            sender_character=character,
            recipient_user=recipient,
            content=content,
            message_type=category,
        )
