from rest_framework import generics, permissions, status
from django.contrib.auth import get_user_model, authenticate, login
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.permissions import IsAuthenticated
import json
from pywebpush import webpush

from .serializers import (RegisterSerializer, ProfileSerializer, ChangePasswordSerializer,
                          PasswordResetConfirmSerializer, PasswordResetRequestSerializer, PasswordResetVerifySerializer)
from .models import Profile, PushSubscription, EmailOTP
import random, string, datetime
from .utils import generate_otp

User = get_user_model()




class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save(is_active=False)

        code = generate_otp(user.email, "register")

        send_mail(
            subject="Your verification code",
            message=f"Code: {code}",
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[user.email],
        )

        return Response({"detail": "Verification code sent"})


class RegisterVerifyView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data["email"]
        code = request.data["code"]

        otp = EmailOTP.objects.filter(
            email=email,
            purpose="register",
            used=False
        ).order_by("-id").first()

        if not otp or not otp.is_valid():
            return Response({"detail": "Invalid or expired code"}, status=400)

        if otp.code != code:
            return Response({"detail": "Wrong code"}, status=400)

        user = User.objects.get(email=email)
        user.is_active = True
        user.save()

        otp.used = True
        otp.save()

        return Response({"detail": "Account verified"})


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
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail":"Password Changed"}, status=status.HTTP_200_OK)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        identifier = request.data.get("identifier", "").strip()
        password = request.data.get("password", "")

        user = authenticate(request, username=identifier, password=password)
        if not user:
            return Response(
                {"detail": "No active account found with the given credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        refresh = RefreshToken.for_user(user)

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "username": user.username
        }, status=status.HTTP_200_OK)

class LoginRequestCodeView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data["email"]

        user = User.objects.filter(email=email).first()
        if not user:
            return Response({"detail": "User not found"}, status=404)

        code = generate_otp(email, "login")

        send_mail(
            subject="Login code",
            message=f"Your login code: {code}",
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[email],
        )

        return Response({"detail": "Code sent"})


class LoginVerifyView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data["email"]
        code = request.data["code"]

        otp = EmailOTP.objects.filter(
            email=email,
            purpose="login",
            used=False
        ).order_by("-id").first()

        if not otp or not otp.is_valid():
            return Response({"detail": "Invalid or expired code"}, status=400)

        if otp.code != code:
            return Response({"detail": "Wrong code"}, status=400)

        user = User.objects.get(email=email)

        refresh = RefreshToken.for_user(user)

        otp.used = True
        otp.save()

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh)
        })


class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data["email"]

        user = User.objects.filter(email=email).first()
        if not user:
            return Response({"detail": "Email not found"}, status=404)

        code = generate_otp(email, "reset")

        send_mail(
            subject="Password reset code",
            message=f"Code: {code}",
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[email],
        )

        return Response({"detail": "OTP sent"})


class PasswordResetVerifyView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data["email"]
        code = request.data["code"]

        otp = EmailOTP.objects.filter(
            email=email,
            purpose="reset",
            used=False
        ).order_by("-id").first()

        if not otp or not otp.is_valid():
            return Response({"detail": "Invalid OTP"}, status=400)

        if otp.code != code:
            return Response({"detail": "Wrong code"}, status=400)

        token = ''.join(random.choices(string.ascii_letters + string.digits, k=32))

        # 🔥 ВАЖЛИВО: ЗБЕРІГАЄМО TOKEN
        otp.token = token
        otp.used = True
        otp.save()

        return Response({"token": token})


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = request.data["token"]
        new_password = request.data["new_password"]

        otp = EmailOTP.objects.filter(
            token=token,
            purpose="reset",
            used=True
        ).first()

        if not otp:
            return Response({"detail": "Invalid token"}, status=400)

        user = User.objects.filter(email=otp.email).first()
        if not user:
            return Response({"detail": "User not found"}, status=404)

        user.set_password(new_password)
        user.save()

        # cleanup
        otp.token = None
        otp.save()

        return Response({"detail": "Password changed"})


class SavePushSubscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        subscription = request.data

        obj, created = PushSubscription.objects.update_or_create(
            user=request.user,
            defaults={"subscription": subscription}
        )

        return Response({
            "status": "ok",
            "created": created
        })


class SendPushView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        subs = PushSubscription.objects.filter(user=request.user)

        for sub in subs:
            webpush(
                subscription_info=sub.subscription,
                data=json.dumps({
                    "title": "Нагадування",
                    "body": "Не забудь виконати звички сьогодні"
                }),
                vapid_private_key=settings.VAPID_PRIVATE_KEY,
                vapid_claims={"sub": "mailto:admin@trackly.local"}
            )

        return Response({"status": "sent"})

