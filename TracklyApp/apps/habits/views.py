from .models import Habit, HabitSchedule, HabitCompletion, FocusSession
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet
from .serializers import HabitSerializer, HabitScheduleSerializer, HabitCompletionSerializer, FocusSessionSerializer


class BaseUserModelViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = self.queryset
        if user.is_superuser:
            return queryset.all()
        return queryset.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_destroy(self, instance):
        instance.delete()


class HabitsView(BaseUserModelViewSet):
    queryset = Habit.objects.all()
    serializer_class = HabitSerializer

class HabitScheduleView(BaseUserModelViewSet):
    queryset = HabitSchedule.objects.all()
    serializer_class = HabitScheduleSerializer

class HabitCompletionView(BaseUserModelViewSet):
    queryset = HabitCompletion.objects.all()
    serializer_class = HabitCompletionSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = self.queryset

        if user.is_superuser:
            return queryset.all()

        return queryset.filter(habit__user=user)


class FocusSessionView(BaseUserModelViewSet):
    queryset = FocusSession.objects.all()
    serializer_class = FocusSessionSerializer