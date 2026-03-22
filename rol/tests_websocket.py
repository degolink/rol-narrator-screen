from asgiref.sync import sync_to_async
from channels.routing import URLRouter
from channels.testing import WebsocketCommunicator
from django.test import TransactionTestCase

import rol.routing
from rol.models import Character

test_application = URLRouter(rol.routing.websocket_urlpatterns)


class WebSocketTests(TransactionTestCase):
    async def test_character_consumer_connection(self):
        # Test connection to the all characters group
        communicator = WebsocketCommunicator(test_application, "/ws/characters/")
        connected, subprotocol = await communicator.connect()
        self.assertTrue(connected)
        await communicator.disconnect()

    async def test_character_update_broadcast(self):
        # Create a character synchronously, but wrapped for async context if needed
        # Or creating it before connecting
        character = await sync_to_async(Character.objects.create)(
            name="Test Hero", hp=10, max_hp=10, level=1
        )

        communicator = WebsocketCommunicator(
            test_application, f"/ws/characters/{character.id}/"
        )
        connected, _ = await communicator.connect()
        self.assertTrue(connected)

        # Update character to trigger signal
        character.hp = 5
        await sync_to_async(character.save)()

        # Receive broadcast
        response = await communicator.receive_json_from(timeout=2)

        self.assertEqual(response["type"], "character_update")
        self.assertEqual(response["data"]["name"], "Test Hero")
        self.assertEqual(response["data"]["hp"], 5)

        await communicator.disconnect()
