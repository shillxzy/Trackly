import uuid
from django.conf import settings
from django.db import models


class Habit(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)


class HabitSchedule(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    habit = models.ForeignKey(Habit, on_delete=models.CASCADE)
    day_of_week = models.SmallIntegerField()


class HabitCompletion(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    habit = models.ForeignKey(Habit, on_delete=models.CASCADE)
    completed_at = models.DateField()

    class Meta:
        unique_together = ("habit", "completed_at")
        indexes = [
            models.Index(fields=["habit", "completed_at"]),
        ]


class FocusSession(models.Model):
    STATUS_CHOICES = (
        ("active", "active"),
        ("completed", "completed"),
        ("canceled", "canceled"),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    started_at = models.DateTimeField()
    ended_at = models.DateTimeField(null=True, blank=True)
    planned_duration_minutes = models.IntegerField(null=True, blank=True)
    actual_duration_minutes = models.IntegerField(null=True, blank=True)
    status = models.CharField(max_length=32, choices=STATUS_CHOICES)
