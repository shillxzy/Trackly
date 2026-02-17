"""
WSGI config for TracklyApp project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

# для dev
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "TracklyApp.settings.development")

# для prod
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "TracklyApp.settings.production")


application = get_wsgi_application()
