from .base import *
import os
from decouple import config

DEBUG = False

RENDER_HOST = os.getenv("RENDER_EXTERNAL_HOSTNAME")

ALLOWED_HOSTS = [
    RENDER_HOST,
]

CSRF_TRUSTED_ORIGINS = [
    f"https://{RENDER_HOST}",
]

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": config("DB_NAME"),
        "USER": config("DB_USER"),
        "PASSWORD": config("DB_PASSWORD"),
        "HOST": config("DB_HOST"),
        "PORT": config("DB_PORT", default="5432"),
        "OPTIONS": {
            "sslmode": "require",
        }
    }
}

CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    "https://your-frontend.vercel.app",
]

SECURE_SSL_REDIRECT = True
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True

LOGIN_REDIRECT_URL = "https://your-frontend.vercel.app/home"
LOGOUT_REDIRECT_URL = "https://your-frontend.vercel.app/login"

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "unique-prod-cache",
    }
}
