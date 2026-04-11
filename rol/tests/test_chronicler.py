import pytest
from django.urls import reverse
from rest_framework import status

from rol.models import ChronicleSession


@pytest.mark.django_db
class TestChroniclerAPI:
    def test_dm_sees_all_sessions(self, dm_client):
        # Create one completed and one waiting session
        ChronicleSession.objects.create(status="COMPLETED")
        ChronicleSession.objects.create(status="WAITING")

        url = reverse("chronicler-list")
        response = dm_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 2

    def test_player_sees_only_completed_sessions(self, auth_client):
        # Create one completed and one waiting session
        ChronicleSession.objects.create(status="COMPLETED", title="Session 1")
        ChronicleSession.objects.create(status="WAITING", title="Session 2")

        url = reverse("chronicler-list")
        response = auth_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["status"] == "COMPLETED"

    def test_stop_action_revokes_task(self, dm_client):
        session = ChronicleSession.objects.create(
            status="TRANSCRIBING", celery_task_id="test-task-id"
        )

        # Use unittest.mock via patch
        from unittest.mock import patch

        with patch("rol.views.celery_app.control.revoke") as mock_revoke:
            url = reverse("chronicler-stop", kwargs={"pk": session.id})
            response = dm_client.post(url)

            assert response.status_code == status.HTTP_200_OK
            session.refresh_from_db()
            assert session.status == "PAUSED"
            assert session.celery_task_id is None
            mock_revoke.assert_called_once_with("test-task-id", terminate=True)
