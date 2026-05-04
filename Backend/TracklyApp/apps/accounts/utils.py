from django.utils import timezone
from datetime import timedelta
import random
from .models import EmailOTP

def generate_otp(email, purpose):
    EmailOTP.objects.filter(email=email, purpose=purpose, used=False).delete()

    code = str(random.randint(100000, 999999))

    otp = EmailOTP.objects.create(
        email=email,
        code=code,
        purpose=purpose,
        expires_at=timezone.now() + timedelta(minutes=10),
        used=False
    )

    return code
