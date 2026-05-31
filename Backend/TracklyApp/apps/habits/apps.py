import os
import sys
from django.apps import AppConfig


class HabitsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "TracklyApp.apps.habits"

    def ready(self):
        # не запускати в тестах
        if "test" in sys.argv:
            return

        # важливо: запускати тільки в child process runserver
        if os.environ.get("RUN_MAIN") != "true":
            return

        from TracklyApp.apps.habits import scheduler as sched_module

        # захист від повторного старту (якщо модуль вже ініціалізований)
        if getattr(sched_module, "_started", False):
            return

        sched_module.start()
        sched_module._started = True

        # keep-alive тільки в продакшні
        if os.environ.get("DJANGO_DEBUG", "True") != "True":
            from TracklyApp.apps.habits.keep_alive import start_keep_alive
            start_keep_alive(sched_module._scheduler)