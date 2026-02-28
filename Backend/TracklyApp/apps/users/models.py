from django.conf import settings
from django.db import models


class Profile(models.Model):
    THEME_CHOICES = (
        ("light", "light"),
        ("dark", "dark"),
    )

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    fullname = models.CharField(max_length=255, blank=True)
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
    theme = models.CharField(max_length=16, choices=THEME_CHOICES, default="dark")

    timezone = models.CharField(max_length=64, default="Europe/Kyiv")
    streak_days = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"Profile of {self.user.username}"
