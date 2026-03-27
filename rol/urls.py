from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import CharacterViewSet, ChatMessageViewSet, ProfileViewSet, RequestMagicLinkView, VerifyMagicLinkView

router = DefaultRouter()
router.register(r"characters", CharacterViewSet, basename="characters")
router.register(r"chat", ChatMessageViewSet, basename="chat")
router.register(r"profile", ProfileViewSet, basename="profile")

urlpatterns = [
    path("auth/magic-link/", RequestMagicLinkView.as_view(), name="magic_link_request"),
    path("auth/verify/", VerifyMagicLinkView.as_view(), name="magic_link_verify"),
    path("", include(router.urls)),
]
