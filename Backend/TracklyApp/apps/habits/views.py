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
        if self.queryset.model.__name__ == "HabitSchedule":
            return queryset.filter(habit__user=user)
        return queryset.filter(user=user)

    def perform_create(self, serializer):
        if serializer.Meta.model.__name__ == "HabitSchedule":
            habit = serializer.validated_data.get("habit")
            if habit.user != self.request.user:
                raise PermissionError("Cannot create schedule for another user's habit")
            serializer.save()
        elif serializer.Meta.model.__name__ == "HabitCompletion":
            serializer.save()
        else:
            serializer.save(user=self.request.user)
        if serializer.Meta.model.__name__ == "FocusSession":
            serializer.save(user=self.request.user)
        else:
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

    def create(self, request, *args, **kwargs):
        print("Incoming payload:", request.data)
        return super().create(request, *args, **kwargs)