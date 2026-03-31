from datetime import timedelta

import pytest
from django.contrib.auth.models import User
from django.urls import reverse
from django.utils import timezone

from rol.models import MagicToken, UserProfile


@pytest.mark.django_db
class TestAuth:
    def test_request_magic_link_success(self, api_client, user):
        url = reverse("magic_link_request")
        response = api_client.post(url, {"email": user.email})

        assert response.status_code == 200
        assert response.data["message"] == "Magic link sent! Check your inbox"
        assert MagicToken.objects.filter(user=user).exists()

    def test_request_magic_link_new_user(self, api_client):
        url = reverse("magic_link_request")
        email = "newuser@example.com"
        username = "newuser"

        # Should fail without username
        response = api_client.post(url, {"email": email})
        assert response.status_code == 404
        assert response.data["code"] == "USER_NOT_FOUND"

        # Should succeed with username
        response = api_client.post(url, {"email": email, "username": username})
        assert response.status_code == 200
        assert User.objects.filter(email=email, username=username).exists()
        assert MagicToken.objects.filter(user__email=email).exists()

    def test_verify_magic_link_success(self, api_client, user):
        token = MagicToken.objects.create(user=user)
        url = reverse("magic_link_verify")

        response = api_client.get(f"{url}?token={token.token}")

        assert response.status_code == 200
        assert response.data["user"]["email"] == user.email
        # Token should be deleted after use
        assert not MagicToken.objects.filter(token=token.token).exists()
        # Should have set cookies (dj-rest-auth)
        assert "rol-auth" in response.cookies

    def test_verify_magic_link_invalid(self, api_client):
        url = reverse("magic_link_verify")
        response = api_client.get(f"{url}?token=00000000-0000-0000-0000-000000000000")

        assert response.status_code == 400
        assert response.data["error"] == "Invalid token"

    def test_verify_magic_link_expired(self, api_client, user):
        token = MagicToken.objects.create(user=user)
        token.expires_at = timezone.now() - timedelta(minutes=1)
        token.save()

        url = reverse("magic_link_verify")
        response = api_client.get(f"{url}?token={token.token}")

        assert response.status_code == 400
        assert response.data["error"] == "Token expired"
