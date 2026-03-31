import pytest
from django.urls import reverse

from rol.models import Character, UserProfile


@pytest.mark.django_db
class TestProfile:
    def test_get_my_profile(self, auth_client, user):
        url = reverse("profile-me")
        response = auth_client.get(url)

        assert response.status_code == 200
        assert response.data["username"] == user.username
        assert response.data["email"] == user.email

    def test_update_profile_fields(self, auth_client, user):
        url = reverse("profile-me")
        new_data = {
            "username": "newusername",
            "first_name": "New"
        }
        response = auth_client.patch(url, new_data)

        assert response.status_code == 200
        user.refresh_from_db()
        assert user.username == "newusername"
        assert user.first_name == "New"

    def test_update_dm_status(self, auth_client, user, character):
        # Assign character first
        character.player = user
        character.save()

        url = reverse("profile-me")
        # Change to DM
        response = auth_client.patch(url, {"is_dungeon_master": True})

        assert response.status_code == 200
        user.profile.refresh_from_db()
        assert user.profile.is_dungeon_master is True

        # When becoming DM, characters should be unassigned (as per views.py logic)
        character.refresh_from_db()
        assert character.player is None

    def test_assign_character_toggle(self, auth_client, user, other_character):
        url = reverse("profile-assign-character")

        # First assignment
        response = auth_client.post(url, {"character_id": other_character.id})
        assert response.status_code == 200
        other_character.refresh_from_db()
        assert other_character.player == user

        # Toggle off
        response = auth_client.post(url, {"character_id": other_character.id})
        assert response.status_code == 200
        other_character.refresh_from_db()
        assert other_character.player is None

    def test_assign_character_invalid(self, auth_client):
        url = reverse("profile-assign-character")
        response = auth_client.post(url, {"character_id": 9999})
        assert response.status_code == 404

    def test_set_active_character_success(self, auth_client, user, character):
        url = reverse("profile-set-active-character")
        response = auth_client.post(url, {"character_id": character.id})

        assert response.status_code == 200
        user.profile.refresh_from_db()
        assert user.profile.active_character == character

    def test_set_active_character_dm_npc(self, dm_client, dm_user, other_character):
        # NPCs are characters not assigned to anyone.
        # Make it visible so DM can pick it.
        other_character.visible = True
        other_character.save()

        url = reverse("profile-set-active-character")
        response = dm_client.post(url, {"character_id": other_character.id})

        assert response.status_code == 200
        dm_user.profile.refresh_from_db()
        assert dm_user.profile.active_character == other_character

    def test_set_active_character_forbidden(self, auth_client, user, other_character):
        # Player cannot pick a character not assigned to them
        url = reverse("profile-set-active-character")
        response = auth_client.post(url, {"character_id": other_character.id})

        assert response.status_code == 403
        user.profile.refresh_from_db()
        assert user.profile.active_character is None

    def test_participants_action(self, auth_client, user, dm_user, character):
        # Set active character for user
        user.profile.active_character = character
        user.profile.save()

        url = reverse("profile-participants")
        response = auth_client.get(url)

        assert response.status_code == 200
        # Results should include DM and the user
        usernames = [p["username"] for p in response.data]
        assert user.username in usernames
        assert dm_user.username in usernames

        # Check display name logic for user with active character
        user_data = next(p for p in response.data if p["username"] == user.username)
        assert user_data["display_name"] == character.name
