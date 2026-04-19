import datetime
import json
from django.core.mail import send_mail
from django.conf import settings
from pywebpush import webpush

from django.contrib.auth import get_user_model
from .models import Habit, HabitSchedule, HabitCompletion
from TracklyApp.apps.accounts.models import PushSubscription

User = get_user_model()

def check_habits_and_notify():
    today = datetime.date.today()
    weekday = today.weekday()

    users = User.objects.all()

    for user in users:
        habits = Habit.objects.filter(user=user, is_active=True)

        missed_habits = []

        for habit in habits:
            scheduled_today = HabitSchedule.objects.filter(
                habit=habit,
                day_of_week=weekday
            ).exists()

            if not scheduled_today:
                continue

            done = HabitCompletion.objects.filter(
                habit=habit,
                completed_at=today
            ).exists()

            if not done:
                missed_habits.append(habit.name)

        if not missed_habits:
            continue

        # 🔥 PUSH
        send_push(user, missed_habits)

        # 🔥 EMAIL
        send_email(user, missed_habits)




def send_push(user, habits):
    try:
        sub = PushSubscription.objects.get(user=user)

        webpush(
            subscription_info=sub.subscription,
            data=json.dumps({
                "title": "Ти пропустив звички",
                "body": f"Невиконано: {', '.join(habits)}"
            }),
            vapid_private_key=settings.VAPID_PRIVATE_KEY,
            vapid_claims={"sub": "mailto:admin@trackly.local"}
        )
    except PushSubscription.DoesNotExist:
        pass


def send_email(user, habits):
    if not user.email:
        return

    send_mail(
        subject="Ти забув звички",
        message=f"Невиконані звички: {', '.join(habits)}",
        from_email=settings.EMAIL_HOST_USER,
        recipient_list=[user.email],
    )

