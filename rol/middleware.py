from urllib.parse import parse_qs

from channels.db import database_sync_to_async


@database_sync_to_async
def get_user(user_id):
    from django.contrib.auth import get_user_model
    from django.contrib.auth.models import AnonymousUser

    User = get_user_model()
    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        return AnonymousUser()


class JWTAuthMiddleware:
    """
    Custom middleware to authenticate Channels connections using JWT in cookies.
    """

    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        from django.conf import settings
        from django.contrib.auth.models import AnonymousUser
        from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
        from rest_framework_simplejwt.tokens import UntypedToken

        # Extract the JWT from the cookie "rol-auth"
        headers = dict(scope["headers"])
        cookie = headers.get(b"cookie", b"").decode()

        token_name = settings.REST_AUTH.get("JWT_AUTH_COOKIE", "rol-auth")

        token = None
        if cookie:
            # Simple cookie parsing
            cookies = {
                c.split("=")[0].strip(): c.split("=")[1].strip()
                for c in cookie.split(";")
                if "=" in c
            }
            token = cookies.get(token_name)

        # Fallback to query string for some development/testing scenarios
        if not token:
            query_string = parse_qs(scope["query_string"].decode())
            token = query_string.get("token", [None])[0]

        if token:
            try:
                # This will validate the token
                UntypedToken(token)
                from rest_framework_simplejwt.authentication import JWTAuthentication

                jwt_auth = JWTAuthentication()
                validated_token = jwt_auth.get_validated_token(token)
                user = await get_user(validated_token["user_id"])
                scope["user"] = user
            except (InvalidToken, TokenError, Exception) as e:
                print(f"JWT Authentication failed: {e}")
                scope["user"] = AnonymousUser()
        else:
            scope["user"] = AnonymousUser()

        return await self.inner(scope, receive, send)


def JWTAuthMiddlewareStack(inner):
    return JWTAuthMiddleware(inner)
