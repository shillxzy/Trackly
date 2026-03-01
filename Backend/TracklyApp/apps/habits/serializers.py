from rest_framework import serializers
from .models import Habit, HabitCompletion, HabitSchedule, FocusSession

class HabitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Habit
        fields = ("id", "name", "description", "is_active", "created_at")


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



class HabitScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = HabitSchedule
        fields = ("id", "habit", "day_of_week")


class FocusSessionSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    class Meta:
        model = FocusSession
        fields = ("id", "user", "started_at", "ended_at", "planned_duration_minutes", "actual_duration_minutes", "status",)

