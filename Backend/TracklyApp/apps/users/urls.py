# users/urls.py
from django.urls import path
from .views import (RegisterView, MeProfileView, ChangePasswordView,
                    LoginView, PasswordResetRequestView, PasswordResetVerifyView, PasswordResetConfirmView)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("me/profile/", MeProfileView.as_view(), name="me-profile"),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
    path("login/", LoginView.as_view(), name="login"),
    path("password-reset/request/", PasswordResetRequestView.as_view()),
    path("password-reset/verify/", PasswordResetVerifyView.as_view()),
    path("password-reset/confirm/", PasswordResetConfirmView.as_view()),


]

