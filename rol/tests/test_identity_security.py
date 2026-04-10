import pytest
from django.urls import reverse
from rol.models import Character

@pytest.mark.django_db
class TestIdentitySecurity:
    def test_cannot_assign_second_character(self, auth_client, user, character, other_character):
        # Assign first character
        character.player = user
        character.save()
        
        url = reverse("profile-assign-character")
        
        # Try to assign a second one
        response = auth_client.post(url, {"character_id": other_character.id})
        
        assert response.status_code == 400
        assert "Ya tienes un personaje asignado" in response.data["error"]
        
        other_character.refresh_from_db()
        assert other_character.player is None

    def test_dm_can_assign_multiple_characters(self, dm_client, dm_user, character, other_character):
        url = reverse("profile-assign-character")
        
        # Assign first
        dm_client.post(url, {"character_id": character.id})
        # Assign second
        response = dm_client.post(url, {"character_id": other_character.id})
        
        assert response.status_code == 200
        character.refresh_from_db()
        other_character.refresh_from_db()
        assert character.player == dm_user
        assert other_character.player == dm_user

    def test_regular_user_cannot_edit_invisible_character(self, auth_client, user, other_character):
        other_character.visible = False
        other_character.save()
        
        url = reverse("characters-detail", args=[other_character.id])
        # Should be 404 because it's filtered out of queryset
        response = auth_client.patch(url, {"name": "Hacked"})
        assert response.status_code == 404

    def test_regular_user_cannot_edit_npc(self, auth_client, user, other_character):
        other_character.visible = True
        other_character.npc = True
        other_character.save()
        
        url = reverse("characters-detail", args=[other_character.id])
        # Should be 403 (PermissionDenied)
        response = auth_client.patch(url, {"name": "Hacked"})
        assert response.status_code == 403

    def test_regular_user_cannot_toggle_visibility(self, auth_client, character):
        character.visible = True
        character.save()
        
        url = reverse("characters-detail", args=[character.id])
        response = auth_client.patch(url, {"visible": False})
        
        assert response.status_code == 200
        character.refresh_from_db()
        assert character.visible is True # Should NOT have changed
