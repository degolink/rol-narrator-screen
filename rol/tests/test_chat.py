import pytest
from django.contrib.auth.models import User
from django.urls import reverse

from rol.models import ChatMessage


@pytest.mark.django_db
class TestChat:
    def test_list_chat_messages(self, auth_client, user, dm_user, character):
        # Create different messages
        ChatMessage.objects.create(sender_user=user, content="Hello World", message_type="IC")
        ChatMessage.objects.create(sender_user=dm_user, content="DM instruction", message_type="OOC")

        url = reverse("chat-list")
        response = auth_client.get(url)

        assert response.status_code == 200
        # Paginated response, data is in 'results'
        assert len(response.data["results"]) >= 2
        assert response.data["results"][0]["content"] == "DM instruction"

    def test_chat_whisper_visibility(self, api_client, user, dm_user):
        # Whisper from User A to User B
        ChatMessage.objects.create(
            sender_user=user,
            recipient_user=dm_user,
            content="Top secret",
            message_type="WHISPER"
        )

        # Whisper to someone else
        User.objects.create_user(username="other", email="other@test.com")
        other_user = User.objects.get(username="other")
        ChatMessage.objects.create(
            sender_user=dm_user,
            recipient_user=other_user,
            content="Other secret",
            message_type="WHISPER"
        )

        url = reverse("chat-list")

        # Auth as User A - should see their whisper
        api_client.force_authenticate(user=user)
        response = api_client.get(url)
        assert response.status_code == 200
        whisper_contents = [m["content"] for m in response.data["results"]]
        assert "Top secret" in whisper_contents
        assert "Other secret" not in whisper_contents

        # Auth as User B - should see their whisper
        api_client.force_authenticate(user=dm_user)
        response = api_client.get(url)
        assert response.status_code == 200
        whisper_contents = [m["content"] for m in response.data["results"]]
        assert "Top secret" in whisper_contents
        assert "Other secret" in whisper_contents # sent by them

    def test_chat_message_identity_serialization(self, auth_client, user, character):
        # Create message with explicit character
        ChatMessage.objects.create(sender_user=user, sender_character=character, content="Identity test")

        url = reverse("chat-list")
        response = auth_client.get(url)

        assert response.status_code == 200
        msg_data = response.data["results"][0]
        assert msg_data["sender_char_id"] == character.id
        assert msg_data["sender_name"] == character.name

