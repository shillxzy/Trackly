from rest_framework import generics, permissions, status
from django.contrib.auth import get_user_model, authenticate, login
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.mail import send_mail
from django.conf import settings


from .serializers import (RegisterSerializer, ProfileSerializer, ChangePasswordSerializer,
                          PasswordResetConfirmSerializer, PasswordResetRequestSerializer, PasswordResetVerifySerializer)
from .models import Profile
import random, string, datetime

User = get_user_model()

reset_codes = {}
reset_tokens = {}


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class MeProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def get_object(self):
        return Profile.objects.get(user=self.request.user)


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



class PasswordResetRequestView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "Email not found"}, status=status.HTTP_404_NOT_FOUND)

        code = f"{random.randint(100000, 999999)}"
        expires = datetime.datetime.now() + datetime.timedelta(minutes=10)
        reset_codes[email] = {"code": code, "expires": expires}

        send_mail(
            subject="Password Reset Code",
            message=f"Your password reset code is: {code}",
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[email],
        )

        return Response({"detail": "Code sent to email"}, status=status.HTTP_200_OK)


class PasswordResetVerifyView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = PasswordResetVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        code = serializer.validated_data["code"]

        if email not in reset_codes:
            return Response({"detail": "No reset request found"}, status=status.HTTP_400_BAD_REQUEST)

        saved = reset_codes[email]
        if saved["code"] != code or datetime.datetime.now() > saved["expires"]:
            return Response({"detail": "Invalid or expired code"}, status=status.HTTP_400_BAD_REQUEST)

        token = ''.join(random.choices(string.ascii_letters + string.digits, k=32))
        reset_tokens[token] = email

        return Response({"token": token}, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = serializer.validated_data["token"]
        new_password = serializer.validated_data["new_password"]

        if token not in reset_tokens:
            return Response({"detail": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)

        email = reset_tokens[token]
        try:
            user = User.objects.get(email=email)
            user.set_password(new_password)
            user.save()
        except User.DoesNotExist:
            return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        reset_tokens.pop(token, None)
        reset_codes.pop(email, None)

        return Response({"detail": "Password changed successfully"}, status=status.HTTP_200_OK)