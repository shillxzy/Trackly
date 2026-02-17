# users/urls.py
from django.urls import path
from .views import RegisterView, MeProfileView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("me/profile/", MeProfileView.as_view(), name="me-profile"),
]
