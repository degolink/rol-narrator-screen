from django.urls import re_path
from django_private_chat2.urls import (
    websocket_urlpatterns as chat_ws_urlpatterns,
)

from . import consumers
from .chat_consumers import ChatConsumer

websocket_urlpatterns = [
    re_path(r"ws/user/$", consumers.UserConsumer.as_asgi()),
    re_path(r"ws/characters/(?P<char_id>\w+)/$", consumers.CharacterConsumer.as_asgi()),
    re_path(r"ws/characters/$", consumers.CharacterConsumer.as_asgi()),
    re_path(r"ws/chat/$", ChatConsumer.as_asgi()),
]

websocket_urlpatterns += chat_ws_urlpatterns
