from .models import Habit, HabitSchedule, HabitCompletion, FocusSession
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet
from .serializers import HabitSerializer, HabitScheduleSerializer, HabitCompletionSerializer, FocusSessionSerializer

class HabitsView(ModelViewSet):
    serializer_class = [HabitSerializer]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Habit.objects.filter(user=self.request.user)
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    def perform_destroy(self, instance):
        instance.delete()

class HabitScheduleView(ModelViewSet):
    serializer_class = HabitScheduleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return HabitSchedule.objects.filter(user=self.request.user)
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    def perform_destroy(self, instance):
        instance.delete()


class HabitCompletionView(ModelViewSet):
    serializer_class = HabitCompletionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return HabitCompletion.objects.filter(user=self.request.user)
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    def perform_destroy(self, instance):
        instance.delete()


class FocusSessionView(ModelViewSet):
    serializer_class = FocusSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return FocusSession.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_destroy(self, instance):
        instance.delete()