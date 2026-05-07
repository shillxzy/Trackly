from rest_framework import serializers
from .models import Habit, HabitCompletion, HabitSchedule, FocusSession


class HabitScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = HabitSchedule
        fields = ("id", "habit", "day_of_week")


class HabitSerializer(serializers.ModelSerializer):
    # FIX: повертаємо schedules разом з habit — фронт отримує schedule вже в об'єкті habit
    schedules = HabitScheduleSerializer(many=True, read_only=True)

    class Meta:
        model = Habit
        fields = ("id", "name", "description", "is_active", "created_at", "schedules")


class HabitCompletionSerializer(serializers.ModelSerializer):
    class Meta:
        model = HabitCompletion
        fields = ("id", "habit", "completed_at")

    def validate(self, attrs):
        habit = attrs.get("habit")
        completed_at = attrs.get("completed_at")

        if HabitCompletion.objects.filter(
            habit=habit,
            completed_at=completed_at
        ).exists():
            raise serializers.ValidationError(
                {"completed_at": "Habit completion for this date already exists."}
            )

        return attrs


class FocusSessionSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = FocusSession
        fields = (
            "id", "user", "started_at", "ended_at",
            "planned_duration_minutes", "actual_duration_minutes", "status",
        )