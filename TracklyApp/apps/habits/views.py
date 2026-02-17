from .models import Habit, HabitSchedule, HabitCompletion, FocusSession
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet
from .serializers import HabitSerializer, HabitScheduleSerializer, HabitCompletionSerializer, FocusSessionSerializer


class BaseUserModelViewSet(ModelViewSet):
    """
    Базовий ViewSet для моделей, які належать користувачу.
    Реалізує get_queryset, perform_create і perform_destroy.
    """
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

class FocusSessionView(BaseUserModelViewSet):
    queryset = FocusSession.objects.all()
    serializer_class = FocusSessionSerializer