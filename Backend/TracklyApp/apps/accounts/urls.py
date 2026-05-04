from django.urls import path
from .views import (
    RegisterView, RegisterVerifyView,
    MeProfileView, ChangePasswordView,
    LoginView, LoginRequestCodeView, LoginVerifyView,
    PasswordResetRequestView, PasswordResetVerifyView, PasswordResetConfirmView,
    SavePushSubscriptionView, SendPushView, DeleteAccountView, RegisterResendCodeView
)

urlpatterns = [
    # AUTH
    path("register/", RegisterView.as_view()),
    path("register/verify/", RegisterVerifyView.as_view()),
    path("register/resend/", RegisterResendCodeView.as_view()),


    path("login/", LoginView.as_view()),
    path("login/request-code/", LoginRequestCodeView.as_view()),
    path("login/verify/", LoginVerifyView.as_view()),

    # PASSWORD RESET
    path("password-reset/request/", PasswordResetRequestView.as_view()),
    path("password-reset/verify/", PasswordResetVerifyView.as_view()),
    path("password-reset/confirm/", PasswordResetConfirmView.as_view()),

    # PROFILE
    path("me/profile/", MeProfileView.as_view()),
    path("change-password/", ChangePasswordView.as_view()),

    # PUSH
    path("push/subscribe/", SavePushSubscriptionView.as_view()),
    path("push/send/", SendPushView.as_view()),
    path("me/", DeleteAccountView.as_view()),


]
