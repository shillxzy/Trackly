from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

User = get_user_model()

class EmailOrUsernameBackend(ModelBackend):
    """
    Аутентифікація через username або email.
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        identifier = username or kwargs.get('identifier')
        if not identifier or not password:
            return None

        try:
            user = User.objects.get(username=identifier)
        except User.DoesNotExist:
            try:
                user = User.objects.get(email__iexact=identifier)
            except User.DoesNotExist:
                return None

        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None
