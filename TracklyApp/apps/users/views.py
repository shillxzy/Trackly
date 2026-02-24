from rest_framework import generics, permissions
from django.contrib.auth import get_user_model
from rest_framework.parsers import MultiPartParser, FormParser

from .serializers import RegisterSerializer, ProfileSerializer
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
