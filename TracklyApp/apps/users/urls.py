# users/urls.py
from django.urls import path
from .views import RegisterView, MeProfileView, ChangePasswordView, LoginView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("me/profile/", MeProfileView.as_view(), name="me-profile"),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
    path("login/", LoginView.as_view(), name="login")
]

