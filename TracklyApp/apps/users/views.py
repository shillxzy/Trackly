from rest_framework import generics, permissions, status
from django.contrib.auth import get_user_model, authenticate, login
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.backends import ModelBackend

from .serializers import RegisterSerializer, ProfileSerializer, ChangePasswordSerializer
from .models import Profile

User = get_user_model()


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
    permission_classes = []

    def post(self, request):
        identifier = request.data.get("identifier", "").strip()
        password = request.data.get("password", "")

        user = authenticate(request, username=identifier, password=password)
        if user:
            login(request, user)
            return Response({"detail": "Login successful", "username": user.username}, status=status.HTTP_200_OK)

        return Response({"detail": "No active account found with the given credentials"}, status=status.HTTP_401_UNAUTHORIZED)


