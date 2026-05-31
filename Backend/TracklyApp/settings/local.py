from .base import *

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": config("BASE_NAME"),
        "USER": config("BASE_USER"),
        "PASSWORD": config("BASE_PASSWORD"),
        "HOST": config("BASE_HOST"),
        "PORT": config("BASE_PORT", default="5432"),
    }
}
