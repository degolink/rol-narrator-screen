import json

from channels.generic.websocket import AsyncWebsocketConsumer


class ChroniclerProgressConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        # Only DM can see progress
        if not self.user.is_authenticated:
            await self.close()
            return

        await self.channel_layer.group_add("chronicler_updates", self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("chronicler_updates", self.channel_name)

    async def chronicler_progress(self, event):
        # Progress update from Celery task
        await self.send(
            text_data=json.dumps(
                {
                    "type": "progress_update",
                    "progress": event["progress"],
                    "status": event["status"],
                    "session_id": event["session_id"],
                }
            )
        )
