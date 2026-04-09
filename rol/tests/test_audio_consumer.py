import json
import shutil
from pathlib import Path

from asgiref.sync import sync_to_async
from channels.routing import URLRouter
from channels.testing import WebsocketCommunicator
from django.conf import settings
from django.contrib.auth.models import User
from django.test import TransactionTestCase, override_settings

import rol.routing

# Re-use the test middleware pattern from test_websocket.py
from .test_websocket import UserInjectionMiddleware

application_under_test = URLRouter(rol.routing.websocket_urlpatterns)

# Use a temporary MEDIA_ROOT so tests don't pollute the real one
TEST_MEDIA_ROOT = Path(settings.BASE_DIR) / "test_media_audio"


@override_settings(MEDIA_ROOT=TEST_MEDIA_ROOT)
class AudioConsumerTests(TransactionTestCase):
    """Integration tests for the AudioConsumer WebSocket consumer."""

    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        # Clean up test media directory
        if TEST_MEDIA_ROOT.exists():
            shutil.rmtree(TEST_MEDIA_ROOT)

    async def _get_communicator(self, user):
        app = UserInjectionMiddleware(application_under_test, user)
        communicator = WebsocketCommunicator(app, "/ws/recording/")
        return communicator

    async def test_authenticated_connection(self):
        """Authenticated users should be able to connect."""
        user = await sync_to_async(User.objects.create_user)(username="audio_user1")
        communicator = await self._get_communicator(user)

        connected, _ = await communicator.connect()
        self.assertTrue(connected)
        await communicator.disconnect()

    async def test_start_creates_file(self):
        """Sending 'start' should create an .ogg file and respond with session_id."""
        user = await sync_to_async(User.objects.create_user)(username="audio_user2")
        communicator = await self._get_communicator(user)
        connected, _ = await communicator.connect()
        self.assertTrue(connected)

        # Send start signal
        await communicator.send_json_to({"type": "start"})
        response = await communicator.receive_json_from(timeout=2)

        self.assertEqual(response["type"], "started")
        self.assertIn("session_id", response)

        session_id = response["session_id"]
        file_path = TEST_MEDIA_ROOT / "recordings" / f"{session_id}.ogg"
        self.assertTrue(file_path.exists())

        await communicator.disconnect()

    async def test_full_recording_lifecycle(self):
        """Test start → binary chunks → stop creates a file with data."""
        user = await sync_to_async(User.objects.create_user)(username="audio_user3")
        communicator = await self._get_communicator(user)
        connected, _ = await communicator.connect()
        self.assertTrue(connected)

        # Start
        await communicator.send_json_to({"type": "start"})
        response = await communicator.receive_json_from(timeout=2)
        session_id = response["session_id"]

        # Send binary audio chunks
        chunk1 = b"\x00\x01\x02\x03" * 100  # 400 bytes
        chunk2 = b"\x04\x05\x06\x07" * 100  # 400 bytes
        await communicator.send_to(bytes_data=chunk1)
        await communicator.send_to(bytes_data=chunk2)

        # Stop
        await communicator.send_json_to({"type": "stop"})
        response = await communicator.receive_json_from(timeout=2)
        self.assertEqual(response["type"], "stopped")

        # Verify file contents
        file_path = TEST_MEDIA_ROOT / "recordings" / f"{session_id}.ogg"
        self.assertTrue(file_path.exists())
        self.assertEqual(file_path.stat().st_size, 800)  # 400 + 400 bytes

        await communicator.disconnect()

    async def test_disconnect_closes_file(self):
        """Disconnecting mid-recording should close the file handle safely."""
        user = await sync_to_async(User.objects.create_user)(username="audio_user5")
        communicator = await self._get_communicator(user)
        connected, _ = await communicator.connect()
        self.assertTrue(connected)

        # Start and send data
        await communicator.send_json_to({"type": "start"})
        response = await communicator.receive_json_from(timeout=2)
        session_id = response["session_id"]

        await communicator.send_to(bytes_data=b"\xff" * 256)

        # Disconnect without stopping
        await communicator.disconnect()

        # File should still exist and be readable (i.e. handle was closed)
        file_path = TEST_MEDIA_ROOT / "recordings" / f"{session_id}.ogg"
        self.assertTrue(file_path.exists())
        self.assertEqual(file_path.stat().st_size, 256)

    async def test_binary_data_without_start_is_ignored(self):
        """Sending binary data before 'start' should be silently ignored."""
        user = await sync_to_async(User.objects.create_user)(username="audio_user6")
        communicator = await self._get_communicator(user)
        connected, _ = await communicator.connect()
        self.assertTrue(connected)

        # Send binary without starting
        await communicator.send_to(bytes_data=b"\x00" * 100)

        # Should not raise — just verify connection is still alive
        await communicator.send_json_to({"type": "start"})
        response = await communicator.receive_json_from(timeout=2)
        self.assertEqual(response["type"], "started")

        await communicator.send_json_to({"type": "stop"})
        await communicator.receive_json_from(timeout=2)

        await communicator.disconnect()

    @override_settings(AUDIO_MAX_DURATION_SECONDS=0)
    async def test_max_duration_enforcement(self):
        """When max duration is exceeded, the server should auto-stop."""
        user = await sync_to_async(User.objects.create_user)(username="audio_user7")
        communicator = await self._get_communicator(user)
        connected, _ = await communicator.connect()
        self.assertTrue(connected)

        # Start
        await communicator.send_json_to({"type": "start"})
        await communicator.receive_json_from(timeout=2)

        # Send binary data — should trigger max_duration since limit is 0
        await communicator.send_to(bytes_data=b"\x00" * 10)
        response = await communicator.receive_json_from(timeout=2)
        self.assertEqual(response["type"], "max_duration")

        await communicator.disconnect()
