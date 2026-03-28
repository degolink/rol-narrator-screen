import json

from channels.generic.websocket import AsyncWebsocketConsumer


class CharacterConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # We can use a general group for all character updates,
        # or a specific group per character if needed.
        # Let's use a global "characters" group for simplicity as per common narrator screen needs,
        # or "character_{id}" to be specific. The plan says "synchronizing character sheet fields".
        # We will listen to specific character IDs or a global update channel.
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

    # Broadcast chat message to WebSockets in group
    async def chat_message_broadcast(self, event):
        message = event["message"]
        clientId = event.get("clientId")

        await self.send(
            text_data=json.dumps(
                {"type": "chat_message", "message": message, "clientId": clientId}
            )
        )
