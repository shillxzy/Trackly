from .base import *

# Локальна розробка
DEBUG = True

# Ці хости можна використовувати для localhost
ALLOWED_HOSTS = ['127.0.0.1', 'localhost']

# Дозволяємо CORS для всіх на локалі
CORS_ALLOW_ALL_ORIGINS = True

# HTTPS на локалі не використовуємо
SECURE_SSL_REDIRECT = False
CSRF_COOKIE_SECURE = False
SESSION_COOKIE_SECURE = False