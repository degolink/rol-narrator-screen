import json

from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import User

from .models import Character, ChatMessage, UserProfile


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

            # Save to DB and get broadcast data
            broadcast_data = await self.process_chat_message(
                self.user, char_id, recipient_id, content, message_category
            )

            if not broadcast_data:
                # Ignore invalid messages from players without characters
                return

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
            is_typing = data.get("is_typing", False)
            # Use sync helper to get name
            char_name = await self.get_typing_name(self.user)

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

    async def character_list_update(self, event):
        # Broadcast global character status changes
        await self.send(text_data=json.dumps(event))

    @sync_to_async
    def process_chat_message(self, user, char_id, recipient_id, content, category):
        """Processes an incoming chat message, validates the sender, and prepares broadcast data."""
        profile = getattr(user, "profile", None)
        character = self._get_validated_character(user, profile, char_id)

        # Strict Constraint: Non-DMs MUST have an active character to send messages
        is_dm = profile.is_dungeon_master if profile else False
        if not character and not is_dm:
            return None

        recipient = None
        if recipient_id:
            recipient = User.objects.filter(id=recipient_id).first()

        message = ChatMessage.objects.create(
            sender_user=user,
            sender_character=character,
            recipient_user=recipient,
            content=content,
            message_type=category,
        )

        return self._prepare_chat_broadcast(
            user, profile, character, message, recipient_id
        )

    def _get_validated_character(self, user, profile, char_id):
        """Determines and validates the character the user is sending as."""
        character = None

        # Priority: char_id from message > active_character from profile
        if char_id:
            if profile and profile.is_dungeon_master:
                character = Character.objects.filter(id=char_id, visible=True).first()
            else:
                character = Character.objects.filter(id=char_id, player=user).first()

        if not character and profile and profile.active_character:
            character = profile.active_character

        # Verify ownership: Only DM can send as any visible character.
        # Players must OWN the character to send as it.
        if character:
            is_valid = False
            if profile and profile.is_dungeon_master:
                if character.visible:
                    is_valid = True
            else:
                if character.player == user:
                    is_valid = True

            if not is_valid:
                character = None

        return character

    def _prepare_chat_broadcast(self, user, profile, character, message, recipient_id):
        """Prepares the data payload to be broadcast to other clients."""
        # Determine sender name
        is_dm = profile.is_dungeon_master if profile else False
        if character:
            sender_name = character.name
        elif is_dm:
            sender_name = "Dungeon Master"
        else:
            sender_name = user.username or "Jugador"

        return {
            "type": "chat_message_event",
            "message": {
                "id": message.id,
                "content": message.content,
                "message_type": message.message_type,
                "sender_name": sender_name,
                "sender_username": user.username,
                "is_sender_dm": is_dm,
                "sender_user_id": user.id,
                "recipient_user_id": recipient_id,
                "created_at": message.created_at.isoformat(),
            },
        }

    @sync_to_async
    def get_typing_name(self, user):
        profile = getattr(user, "profile", None)
        if profile and profile.active_character:
            return profile.active_character.name
        elif profile and profile.is_dungeon_master:
            return "Dungeon Master"
        return user.username or "Jugador"
