"""
Backend/TracklyApp/apps/habits/services.py
"""

import datetime
import json
import logging

from django.core.mail import send_mail
from django.conf import settings

from django.contrib.auth import get_user_model
from .models import Habit, HabitSchedule, HabitCompletion
from TracklyApp.apps.accounts.models import PushSubscription

logger = logging.getLogger(__name__)

User = get_user_model()

# Bitmask: Python weekday() → 0=Пн, 1=Вт, ..., 6=Нд
# Наш bitmask:              Пн=1, Вт=2, Ср=4, Чт=8, Пт=16, Сб=32, Нд=64
WEEKDAY_TO_MASK = {0: 1, 1: 2, 2: 4, 3: 8, 4: 16, 5: 32, 6: 64}


def check_habits_and_notify():
    """
    Головна функція — викликається щодня о 19:00 Київ.
    Знаходить користувачів які не виконали сьогоднішні звички і надсилає email.
    """
    import pytz

    kyiv_tz = pytz.timezone("Europe/Kyiv")
    today = datetime.datetime.now(kyiv_tz).date()
    weekday = today.weekday()
    today_mask = WEEKDAY_TO_MASK[weekday]

    logger.info(f"[check_habits] Running for {today}, weekday={weekday}, mask={today_mask}")

    users = User.objects.filter(is_active=True)
    total_sent = 0

    for user in users:
        habits = Habit.objects.filter(
            user=user,
            is_active=True
        ).prefetch_related("schedules")

        missed_habits = []

        for habit in habits:
            schedule = habit.schedules.first()
            if not schedule:
                continue

            # Перевіряємо чи ця звичка запланована на сьогодні
            if not (schedule.day_of_week & today_mask):
                continue

            # Перевіряємо чи вже виконана
            done = HabitCompletion.objects.filter(
                habit=habit,
                completed_at=today
            ).exists()

            if not done:
                missed_habits.append(habit.name)

        if not missed_habits:
            logger.info(f"[check_habits] User {user.email} — all habits done, skipping")
            continue

        logger.info(
            f"[check_habits] User {user.email} missed {len(missed_habits)} habits: {missed_habits}"
        )

        send_email_notification(user, missed_habits)
        total_sent += 1

    logger.info(f"[check_habits] Done. Emails sent to {total_sent} users.")


def send_email_notification(user, missed_habits: list[str]):
    """
    Надсилає email користувачу зі списком невиконаних звичок.
    """
    if not user.email:
        logger.warning(f"[check_habits] User {user.username} has no email, skipping")
        return

    habits_list = "\n".join(f"  • {h}" for h in missed_habits)

    subject = "⏰ Trackly — ти ще не виконав звички сьогодні"

    message = (
        f"Привіт, {user.username}!\n\n"
        f"Сьогодні до 19:00 ти не відмітив наступні звички як виконані:\n\n"
        f"{habits_list}\n\n"
        f"Ще є час — зайди в Trackly і виконай їх!\n\n"
        f"— Команда Trackly"
    )

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        logger.info(f"[check_habits] Email sent to {user.email}")
    except Exception as e:
        logger.error(f"[check_habits] Failed to send email to {user.email}: {e}")