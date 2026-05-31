from .base import *

DEBUG = False

RENDER_BACKEND_HOST  = "trackly-0xg3.onrender.com"
RENDER_FRONTEND_HOST = "trackly-frontend-f4ri.onrender.com"

ALLOWED_HOSTS = [
    RENDER_BACKEND_HOST,
    ".onrender.com",
]

CSRF_TRUSTED_ORIGINS = [
    f"https://{RENDER_BACKEND_HOST}",
    f"https://{RENDER_FRONTEND_HOST}",
]

# ── Database (Neon) ───────────────────────────────────────────
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME":     config("DB_NAME"),
        "USER":     config("DB_USER"),
        "PASSWORD": config("DB_PASSWORD"),
        "HOST":     config("DB_HOST"),
        "PORT":     config("DB_PORT", default="5432"),
        "OPTIONS": {
            "sslmode": "require",
        },
        # Conn pooling — зменшує час на встановлення з'єднання після cold start
        "CONN_MAX_AGE": 60,
    }
}

# ── Static files через WhiteNoise ─────────────────────────────
# WhiteNoise роздає статику напряму з gunicorn без окремого nginx
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",   # одразу після Security
    *[m for m in MIDDLEWARE if m != "django.middleware.security.SecurityMiddleware"],
]

STATIC_URL  = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
# Стискає і кешує статику (CSS/JS) — швидше завантаження
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# ── CORS ──────────────────────────────────────────────────────
CORS_ALLOW_ALL_ORIGINS   = False
CORS_ALLOW_CREDENTIALS   = True
CORS_ALLOWED_ORIGINS     = [
    f"https://{RENDER_FRONTEND_HOST}",
]

# ── Security ──────────────────────────────────────────────────
SECURE_SSL_REDIRECT         = True
CSRF_COOKIE_SECURE          = True
SESSION_COOKIE_SECURE       = True
SECURE_HSTS_SECONDS         = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True

# ── Redirects ─────────────────────────────────────────────────
LOGIN_REDIRECT_URL  = f"https://{RENDER_FRONTEND_HOST}/home"
LOGOUT_REDIRECT_URL = f"https://{RENDER_FRONTEND_HOST}/login"

# ── Cache (in-memory, без Redis) ──────────────────────────────
CACHES = {
    "default": {
        "BACKEND":  "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "trackly-prod",
    }
}
