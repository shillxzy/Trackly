from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model
from TracklyApp.apps.habits.models import Habit, HabitSchedule, HabitCompletion, FocusSession

User = get_user_model()

class Command(BaseCommand):
    help = "Seed the database with users, habits, and focus sessions"

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding database...")

        users_data = [
            {"username": "user1", "email": "user1@example.com", "password": "password1"},
            {"username": "user2", "email": "user2@example.com", "password": "password2"},
            {"username": "user3", "email": "user3@example.com", "password": "password3"},
        ]

        users = []
        for udata in users_data:
            user, created = User.objects.get_or_create(
                username=udata["username"],
                defaults={"email": udata["email"]}
            )
            if created:
                user.set_password(udata["password"])
                user.save()
                self.stdout.write(self.style.SUCCESS(f"Created user: {user.username}"))
            users.append(user)

        for user in users:
            habits = []
            for i in range(2):
                habit = Habit.objects.create(
                    user=user,
                    name=f"{user.username} Habit {i+1}",
                    description=f"Description for {user.username} Habit {i+1}"
                )
                habits.append(habit)

                for day in range(1, 4):
                    HabitSchedule.objects.create(habit=habit, day_of_week=day)

                for delta in range(3):
                    HabitCompletion.objects.get_or_create(
                        habit=habit,
                        completed_at=timezone.now().date() - timedelta(days=delta)
                    )
            for i in range(2):
                FocusSession.objects.create(
                    user=user,
                    started_at=timezone.now() - timedelta(minutes=30*i),
                    ended_at=timezone.now() - timedelta(minutes=30*i-25),
                    planned_duration_minutes=25,
                    actual_duration_minutes=25,
                    status="completed"
                )
