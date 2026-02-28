from rest_framework.routers import DefaultRouter
from .views import HabitsView, HabitScheduleView, HabitCompletionView, FocusSessionView

router = DefaultRouter()
router.register("habits", HabitsView, basename="habits")
router.register("habit-schedules", HabitScheduleView, basename="habit-schedules")
router.register("habit-completions", HabitCompletionView, basename="habit-completions")
router.register("focus-sessions", FocusSessionView, basename="focus-sessions")

urlpatterns = router.urls
