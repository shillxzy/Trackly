import random
from datetime import timedelta
from django.utils import timezone
from .models import EmailOTP

def generate_otp(email, purpose):
    code = str(random.randint(100000, 999999))

    EmailOTP.objects.create(
        email=email,
        code=code,
        purpose=purpose,
        expires_at=timezone.now() + timedelta(minutes=10)
    )

    return code
