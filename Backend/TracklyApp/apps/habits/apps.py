"""
Backend/TracklyApp/apps/habits/apps.py
"""

from django.apps import AppConfig


class HabitsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "TracklyApp.apps.habits"

    def ready(self):
        """
        Викликається Django один раз при старті сервера.
        Тут запускаємо планувальник.
        """
        import os

        # Захист від подвійного запуску в режимі Django dev server
        # (dev server запускає ready() двічі через autoreload)
        if os.environ.get("RUN_MAIN") != "true":
            return

        from TracklyApp.apps.habits import scheduler
        scheduler.start()