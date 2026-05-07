"""
Backend/TracklyApp/apps/habits/scheduler.py

Запускається автоматично при старті Django через apps.py (ready метод).
Щодня о 19:00 за київським часом перевіряє невиконані звички і надсилає email.
"""

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
import pytz
import logging

logger = logging.getLogger(__name__)

_scheduler = None


def start():
    global _scheduler

    if _scheduler is not None:
        return  # вже запущений — не запускати двічі

    from TracklyApp.apps.habits.services import check_habits_and_notify

    _scheduler = BackgroundScheduler(timezone=pytz.utc)

    _scheduler.add_job(
        check_habits_and_notify,
        trigger=CronTrigger(
            hour=16,       # 16:00 UTC = 19:00 Kyiv (UTC+3)
            minute=0,
            timezone=pytz.utc,
        ),
        id="check_habits",
        name="Check habits and send email notifications",
        replace_existing=True,
        misfire_grace_time=300,  # якщо сервер був вимкнений — дозволяємо запізнення до 5 хв
    )

    _scheduler.start()
    logger.info("Habit scheduler started — runs daily at 19:00 Kyiv time")