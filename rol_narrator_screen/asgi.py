"""
ASGI config for rol_narrator_screen project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application

# Set settings before initializing any Django-related code
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "rol_narrator_screen.settings")
django_asgi_app = get_asgi_application()

# Import Channels and middleware after Django is ready
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator

from rol.middleware import JWTAuthMiddleware
import rol.routing  # noqa: E402

application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": AllowedHostsOriginValidator(
            JWTAuthMiddleware(URLRouter(rol.routing.websocket_urlpatterns))
        ),
    }
)
