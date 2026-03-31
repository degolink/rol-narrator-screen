import pytest
from django.urls import reverse

from rol.models import Character


@pytest.mark.django_db
class TestCharacters:
    def test_list_characters(self, auth_client, character, other_character):
        url = reverse("characters-list")
        response = auth_client.get(url)

        assert response.status_code == 200
        # Should see all characters (DM view or common list)
        assert len(response.data) >= 2

    def test_list_characters_visible_filter(self, auth_client, character, other_character):
        url = reverse("characters-list")

        # Visible only
        response = auth_client.get(f"{url}?visible=true")
        assert response.status_code == 200
        for char in response.data:
            assert char["visible"] is True

        # Invisible only
        response = auth_client.get(f"{url}?visible=false")
        assert response.status_code == 200
        for char in response.data:
            assert char["visible"] is False

    def test_my_characters(self, auth_client, user, character, other_character):
        url = reverse("characters-my-characters")
        response = auth_client.get(url)

        assert response.status_code == 200
        # only 'character' belongs to user
        assert len(response.data) == 1
        assert response.data[0]["id"] == character.id

    def test_create_character_success(self, auth_client):
        url = reverse("characters-list")
        data = {
            "name": "New Hero",
            "char_class": "Warrior",
            "race": "Human",
            "alignment": "Neutral",
            "hp": 12,
            "max_hp": 12,
            "visible": True
        }
        response = auth_client.post(url, data)
        assert response.status_code == 201
        assert Character.objects.filter(name="New Hero").exists()

    def test_create_character_validation_error(self, auth_client):
        url = reverse("characters-list")
        # Missing required fields for non-NPC
        data = {
            "name": "New Hero",
            "hp": 12,
            "max_hp": 12,
        }
        response = auth_client.post(url, data)
        assert response.status_code == 400
        assert "char_class" in response.data

    def test_retrieve_character(self, auth_client, character):
        url = reverse("characters-detail", args=[character.id])
        response = auth_client.get(url)
        assert response.status_code == 200
        assert response.data["name"] == character.name

    def test_update_character(self, auth_client, character):
        url = reverse("characters-detail", args=[character.id])
        response = auth_client.patch(url, {"hp": 5})
        assert response.status_code == 200
        character.refresh_from_db()
        assert character.hp == 5

    def test_delete_character(self, auth_client, character):
        url = reverse("characters-detail", args=[character.id])
        response = auth_client.delete(url)
        assert response.status_code == 204
        assert not Character.objects.filter(id=character.id).exists()
