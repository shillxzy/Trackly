from django.core.management.base import BaseCommand
from TracklyApp.apps.habits.services import check_habits_and_notify


class Command(BaseCommand):
    help = "Check habits and send notifications"

    def handle(self, *args, **kwargs):
        check_habits_and_notify()
        self.stdout.write("Done")

