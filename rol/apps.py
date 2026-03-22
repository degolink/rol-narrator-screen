from django.apps import AppConfig


class RolConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "rol"

    def ready(self):
        import rol.signals
