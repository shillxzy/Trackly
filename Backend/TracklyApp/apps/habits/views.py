from .models import Habit, HabitSchedule, HabitCompletion, FocusSession
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet
from .serializers import (
    HabitSerializer, HabitScheduleSerializer,
    HabitCompletionSerializer, FocusSessionSerializer
)


class BaseUserModelViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = self.queryset
        if user.is_superuser:
            return queryset.all()
        if self.queryset.model.__name__ == "HabitSchedule":
            return queryset.filter(habit__user=user)
        return queryset.filter(user=user)

    def perform_create(self, serializer):
        model_name = serializer.Meta.model.__name__

        if model_name == "HabitSchedule":
            habit = serializer.validated_data.get("habit")
            if habit.user != self.request.user:
                raise PermissionError("Cannot create schedule for another user's habit")
            serializer.save()

        elif model_name == "HabitCompletion":
            habit = serializer.validated_data.get("habit")
            if habit.user != self.request.user:
                raise PermissionError("Cannot complete another user's habit")
            serializer.save()

        else:
            serializer.save(user=self.request.user)

    def perform_destroy(self, instance):
        instance.delete()


class HabitsView(BaseUserModelViewSet):
    queryset = Habit.objects.all().select_related("user").prefetch_related("schedules")
    serializer_class = HabitSerializer


class HabitScheduleView(BaseUserModelViewSet):
    queryset = HabitSchedule.objects.all().select_related("habit", "habit__user")
    serializer_class = HabitScheduleSerializer


class HabitCompletionView(BaseUserModelViewSet):
    queryset = HabitCompletion.objects.all().select_related("habit", "habit__user")
    serializer_class = HabitCompletionSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = self.queryset
        if user.is_superuser:
            return queryset.all()
        return queryset.filter(habit__user=user)

    def perform_create(self, serializer):
        habit = serializer.validated_data.get("habit")
        if habit.user != self.request.user:
            raise PermissionError("Cannot complete another user's habit")

        serializer.save()

        # FIX: після збереження completion — перераховуємо streak
        recalculate_streak(self.request.user)


class FocusSessionView(BaseUserModelViewSet):
    queryset = FocusSession.objects.all()
    serializer_class = FocusSessionSerializer


# ─────────────────────────────────────────────
#  Streak логіка
# ─────────────────────────────────────────────

def recalculate_streak(user):
    """
    Рахує поточну серію днів підряд де користувач виконав
    ВСІ заплановані на той день звички.

    Алгоритм:
    1. Беремо всі дати completions користувача (від новіших до старших)
    2. Йдемо назад від сьогодні
    3. Для кожного дня перевіряємо чи виконані ВСІ заплановані звички
    4. Як тільки знаходимо день де не всі виконані — зупиняємось
    """
    import datetime
    from TracklyApp.apps.accounts.models import Profile

    WEEKDAY_MASK = {0: 1, 1: 2, 2: 4, 3: 8, 4: 16, 5: 32, 6: 64}

    habits = list(
        Habit.objects.filter(user=user, is_active=True).prefetch_related("schedules")
    )

    today = datetime.date.today()
    streak = 0

    for days_ago in range(0, 365):
        check_date = today - datetime.timedelta(days=days_ago)
        weekday_mask = WEEKDAY_MASK[check_date.weekday()]

        scheduled = [
            h for h in habits
            if h.schedules.all() and (h.schedules.first().day_of_week & weekday_mask)
        ]

        if not scheduled:
            if days_ago == 0:
                continue
            else:
                continue

        completed_ids = set(
            HabitCompletion.objects.filter(
                habit__user=user,
                completed_at=check_date
            ).values_list("habit_id", flat=True)
        )

        all_done = all(h.id in completed_ids for h in scheduled)

        if all_done:
            streak += 1
        else:
            if days_ago == 0:
                continue
            else:
                break

    profile, _ = Profile.objects.get_or_create(user=user)
    profile.streak_days = streak
    profile.save(update_fields=["streak_days"])