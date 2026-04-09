import json

from channels.generic.websocket import AsyncWebsocketConsumer


class CharacterConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        if not self.user.is_authenticated:
            await self.close()
            return

        # We can use a general group for all character updates,
        self.character_id = self.scope["url_route"]["kwargs"].get("char_id", "all")
        self.room_group_name = f"character_{self.character_id}"

        # Join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    # Receive message from WebSocket
    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message_type = text_data_json.get("type")

            if message_type == "chat_message":
                message = text_data_json.get("message")
                clientId = text_data_json.get("clientId")

                # Send message to room group
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "chat_message_broadcast",
                        "message": message,
                        "clientId": clientId,
                    },
                )
        except json.JSONDecodeError:
            pass

    # Receive message from room group
    async def character_update(self, event):
        character_data = event["data"]

        # Send message to WebSocket
        await self.send(
            text_data=json.dumps({"type": "character_update", "data": character_data})
        )

    async def character_deleted(self, event):
        char_id = event["id"]

        # Send message to WebSocket
        await self.send(
            text_data=json.dumps({"type": "character_deleted", "id": char_id})
        )

    async def chat_message_broadcast(self, event):
        message = event["message"]
        clientId = event.get("clientId")

        await self.send(
            text_data=json.dumps(
                {"type": "chat_message", "message": message, "clientId": clientId}
            )
        )


class UserConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        if not self.user.is_authenticated:
            await self.close()
            return

        self.user_group = f"user_{self.user.id}"

        # Join private group and global broadcast group
        await self.channel_layer.group_add(self.user_group, self.channel_name)
        await self.channel_layer.group_add("broadcast", self.channel_name)

        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "user_group"):
            await self.channel_layer.group_discard(self.user_group, self.channel_name)
            await self.channel_layer.group_discard("broadcast", self.channel_name)

    async def profile_update_event(self, event):
        # Send full profile data to the WebSocket client
        await self.send(
            text_data=json.dumps({"type": "profile_update", "data": event["data"]})
        )

    async def recording_status(self, event):
        # Forward broadcast to WebSocket
        await self.send(
            text_data=json.dumps(
                {
                    "type": "recording_status",
                    "status": event["status"],
                    "user": event["user"],
                }
            )
        )
