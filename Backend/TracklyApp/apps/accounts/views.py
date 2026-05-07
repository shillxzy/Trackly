from rest_framework import generics, permissions, status
from django.contrib.auth import get_user_model, authenticate
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.permissions import IsAuthenticated
import json
import random
import string
from pywebpush import webpush

from .serializers import (
    RegisterSerializer, ProfileSerializer, ChangePasswordSerializer,
    PasswordResetConfirmSerializer, PasswordResetRequestSerializer, PasswordResetVerifySerializer
)
from .models import Profile, PushSubscription, EmailOTP
from .utils import generate_otp

User = get_user_model()


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save(is_active=False)
        code = generate_otp(user.email, "register")

        try:
            send_mail(
                subject="Your verification code",
                message=f"Code: {code}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
            )
        except Exception as e:
            print("EMAIL ERROR:", e)

        return Response({"detail": "Verification code sent"})


class RegisterVerifyView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")
        code = request.data.get("code")

        if not email or not code:
            return Response({"detail": "Email and code required"}, status=400)

        otp = EmailOTP.objects.filter(email=email, purpose="register", used=False).last()

        if not otp:
            return Response({"detail": "Invalid code"}, status=400)

        if not otp.is_valid():
            return Response({"detail": "Code expired"}, status=400)

        if otp.code != code:
            otp.attempts += 1
            otp.save()
            if otp.attempts >= 5:
                otp.used = True
                otp.save()
            return Response({"detail": "Wrong code"}, status=400)

        user = User.objects.filter(email=email).first()
        if not user:
            return Response({"detail": "User not found"}, status=404)

        user.is_active = True
        user.save()
        otp.used = True
        otp.save()

        return Response({"detail": "Account verified"})


class RegisterResendCodeView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")
        user = User.objects.filter(email=email).first()

        if not user:
            return Response({"detail": "User not found"}, status=404)
        if user.is_active:
            return Response({"detail": "User already verified"}, status=400)

        code = generate_otp(email, "register")
        send_mail(
            subject="Your verification code",
            message=f"Code: {code}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
        )
        return Response({"detail": "Code resent"})


class MeProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def get_object(self):
        profile, _ = Profile.objects.get_or_create(user=self.request.user)
        return profile


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Password Changed"}, status=status.HTTP_200_OK)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        identifier = request.data.get("identifier", "").strip()
        password = request.data.get("password", "")
        user = authenticate(request, username=identifier, password=password)

        if not user or not user.is_active:
            return Response(
                {"detail": "Account not verified or invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "username": user.username,
        })


class LoginRequestCodeView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")
        user = User.objects.filter(email=email).first()
        if not user:
            return Response({"detail": "User not found"}, status=404)

        code = generate_otp(email, "login")
        send_mail(
            subject="Login code",
            message=f"Your login code: {code}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
        )
        return Response({"detail": "Code sent"})


class LoginVerifyView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")
        code = request.data.get("code")

        otp = EmailOTP.objects.filter(email=email, purpose="login", used=False).last()
        if not otp:
            return Response({"detail": "Code not found"}, status=400)
        if not otp.is_valid():
            return Response({"detail": "Code expired"}, status=400)

        if otp.code != code:
            otp.attempts += 1
            otp.save()
            if otp.attempts >= 5:
                otp.used = True
                otp.save()
            return Response({"detail": "Wrong code"}, status=400)

        user = User.objects.filter(email=email).first()
        if not user or not user.is_active:
            return Response({"detail": "User not active"}, status=400)

        refresh = RefreshToken.for_user(user)
        otp.used = True
        otp.save()

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        })


class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")
        user = User.objects.filter(email=email).first()
        if not user:
            return Response({"detail": "Email not found"}, status=404)

        code = generate_otp(email, "reset")
        send_mail(
            subject="Password reset code",
            message=f"Code: {code}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
        )
        return Response({"detail": "OTP sent"})


class PasswordResetVerifyView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")
        code = request.data.get("code")

        otp = EmailOTP.objects.filter(email=email, purpose="reset", used=False).last()
        if not otp:
            return Response({"detail": "Code not found"}, status=400)
        if not otp.is_valid():
            return Response({"detail": "Code expired"}, status=400)

        if otp.code != code:
            otp.attempts += 1
            otp.save()
            if otp.attempts >= 5:
                otp.used = True
                otp.save()
            return Response({"detail": "Wrong code"}, status=400)

        token = "".join(random.choices(string.ascii_letters + string.digits, k=32))
        otp.token = token
        otp.used = True
        otp.save()

        return Response({"token": token})


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = request.data.get("token")
        new_password = request.data.get("new_password")

        otp = EmailOTP.objects.filter(token=token, purpose="reset").last()
        if not otp:
            return Response({"detail": "Invalid token"}, status=400)

        user = User.objects.filter(email=otp.email).first()
        if not user:
            return Response({"detail": "User not found"}, status=404)

        user.set_password(new_password)
        user.save()
        otp.token = None
        otp.save()

        return Response({"detail": "Password changed"})


class SavePushSubscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        subscription = request.data
        obj, created = PushSubscription.objects.update_or_create(
            user=request.user,
            defaults={"subscription": subscription},
        )
        return Response({"status": "ok", "created": created})


class SendPushView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        subs = PushSubscription.objects.filter(user=request.user)
        for sub in subs:
            webpush(
                subscription_info=sub.subscription,
                data=json.dumps({
                    # FIX: виправлено кодування — було зламане latin1/utf-8 mix
                    "title": "Нагадування",
                    "body": "Не забудь виконати звички сьогодні",
                }),
                vapid_private_key=settings.VAPID_PRIVATE_KEY,
                vapid_claims={"sub": "mailto:admin@trackly.local"},
            )
        return Response({"status": "sent"})


class DeleteAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = request.user
        PushSubscription.objects.filter(user=user).delete()
        Profile.objects.filter(user=user).delete()
        user.delete()
        return Response({"detail": "Account deleted"}, status=status.HTTP_204_NO_CONTENT)