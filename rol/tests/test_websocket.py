from asgiref.sync import sync_to_async
from channels.routing import URLRouter
from channels.testing import WebsocketCommunicator
from django.contrib.auth.models import User
from django.test import TransactionTestCase

import rol.routing
from rol.models import Character


# Simple wrapper to inject a user into the scope for testing
class UserInjectionMiddleware:
    def __init__(self, inner, user):
        self.inner = inner
        self.user = user

    async def __call__(self, scope, receive, send):
        scope = dict(scope)
        scope["user"] = self.user
        return await self.inner(scope, receive, send)

application_under_test = URLRouter(rol.routing.websocket_urlpatterns)


class WebSocketTests(TransactionTestCase):
    async def test_character_consumer_connection(self):
        user = await sync_to_async(User.objects.create_user)(username="testuser")
        app = UserInjectionMiddleware(application_under_test, user)

        # Test connection to the all characters group
        communicator = WebsocketCommunicator(app, "/ws/characters/")
        connected, _ = await communicator.connect()
        self.assertTrue(connected)
        await communicator.disconnect()

    async def test_character_update_broadcast(self):
        user = await sync_to_async(User.objects.create_user)(username="testuser2")
        app = UserInjectionMiddleware(application_under_test, user)

        # Create a character
        character = await sync_to_async(Character.objects.create)(
            name="Test Hero",
            char_class="Warrior",
            race="Human",
            alignment="Neutral",
            hp=10,
            max_hp=10,
            level=1
        )

        communicator = WebsocketCommunicator(
            app, f"/ws/characters/{character.id}/"
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
