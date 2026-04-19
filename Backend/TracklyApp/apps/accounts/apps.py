from django.apps import AppConfig


class UsersConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = 'TracklyApp.apps.accounts'

    def ready(self):
        import TracklyApp.apps.accounts.signals