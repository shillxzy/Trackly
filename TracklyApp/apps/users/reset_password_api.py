from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
import smtplib, random, os
from dotenv import load_dotenv

load_dotenv()

SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASS = os.getenv("SMTP_PASS")

app = FastAPI()

codes = {}
tokens = {}


class EmailRequest(BaseModel):
    email: EmailStr


class CodeRequest(BaseModel):
    email: EmailStr
    code: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


@app.post("/api/password-reset/request")
def request_reset(req: EmailRequest):
    code = f"{random.randint(100000, 999999)}"
    codes[req.email] = code

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(
                SMTP_USER,
                req.email,
                f"Subject: Password Reset Code\n\nYour code is: {code}"
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"detail": "Code sent"}
