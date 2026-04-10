import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient

from rol.models import Character, UserProfile


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user(db):
    user = User.objects.create_user(username="testuser", email="test@example.com")
    # UserProfile is created via signal, but let's ensure it's there
    UserProfile.objects.get_or_create(user=user)
    return user


@pytest.fixture
def dm_user(db):
    user = User.objects.create_user(username="dmuser", email="dm@example.com")
    profile, _ = UserProfile.objects.get_or_create(user=user)
    profile.is_dungeon_master = True
    profile.save()
    return user


@pytest.fixture
def auth_client(user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def dm_client(dm_user):
    client = APIClient()
    client.force_authenticate(user=dm_user)
    return client


@pytest.fixture
def character(db, user):
    return Character.objects.create(
        name="Test Hero",
        char_class="Warrior",
        race="Human",
        alignment="Neutral",
        hp=10,
        max_hp=10,
        level=1,
        player=user,
        visible=True,
    )


@pytest.fixture
def other_character(db):
    return Character.objects.create(
        name="Other Hero",
        char_class="Mage",
        race="Elf",
        alignment="Good",
        hp=15,
        max_hp=15,
        level=2,
        visible=False,
    )
