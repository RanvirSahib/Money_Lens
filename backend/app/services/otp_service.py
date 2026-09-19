"""
OTP Generation, Storage, and Email Dispatch Service.
Supports AWS RDS PostgreSQL persistence with optional SMTP / AWS SES delivery.
"""

import os
import secrets
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any

from app.core.database import get_db_connection, DatabaseNotConfiguredError

logger = logging.getLogger(__name__)

# Fallback in-memory OTP store if DB is unavailable
_memory_otps: Dict[str, Dict[str, Any]] = {}


class OtpService:
    @staticmethod
    def generate_otp() -> str:
        """Generates a secure 6-digit numerical OTP string."""
        return f"{secrets.randbelow(900000) + 100000}"

    @classmethod
    def send_email_otp(cls, to_email: str, otp_code: str, purpose: str = "Authentication") -> bool:
        """
        Dispatches OTP email via standard SMTP if configured.
        Falls back to logging for development/sandbox mode.
        """
        smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
        smtp_user = os.getenv("SMTP_USERNAME")
        smtp_pass = os.getenv("SMTP_PASSWORD")
        from_email = os.getenv("SMTP_FROM_EMAIL") or smtp_user or "ranvir.sahibadv88@gmail.com"

        if smtp_server and smtp_user and smtp_pass:
            try:
                msg = MIMEMultipart("alternative")
                msg["Subject"] = f"{otp_code} is your MoneyLens Verification Code"
                msg["From"] = f"MoneyLens Security <{from_email}>"
                msg["To"] = to_email

                text_content = f"Your MoneyLens verification code is: {otp_code}\n\nThis code expires in 10 minutes."
                html_content = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
</head>
<body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #030712; color: #f8fafc;">
    <div style="max-width: 500px; margin: 0 auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
        <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #38bdf8; font-size: 24px; margin: 0; font-weight: 800; letter-spacing: -0.5px;">MoneyLens</h1>
            <p style="color: #94a3b8; font-size: 13px; margin-top: 4px;">AI-Powered Predictive Financial Platform</p>
        </div>
        <div style="background: #1e293b; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <p style="color: #94a3b8; font-size: 14px; margin-top: 0; margin-bottom: 12px;">Your 6-digit {purpose.lower()} code is:</p>
            <div style="font-family: monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #38bdf8; background: #0f172a; padding: 14px; border-radius: 8px; display: inline-block;">
                {otp_code}
            </div>
            <p style="color: #64748b; font-size: 12px; margin-top: 12px; margin-bottom: 0;">⏱️ Valid for 10 minutes</p>
        </div>
        <p style="color: #64748b; font-size: 12px; line-height: 1.5; text-align: center; margin: 0;">
            If you did not request this verification code, you can safely ignore this email.
        </p>
    </div>
</body>
</html>"""
                msg.attach(MIMEText(text_content, "plain"))
                msg.attach(MIMEText(html_content, "html"))

                with smtplib.SMTP(smtp_server, smtp_port, timeout=15) as server:
                    server.starttls()
                    server.login(smtp_user, smtp_pass)
                    server.send_message(msg)
                logger.info(f"Successfully dispatched OTP email to {to_email} via SMTP ({smtp_server})")
                return True
            except Exception as e:
                logger.error(f"Failed to send OTP via SMTP: {e}")
                raise e

    @classmethod
    def create_and_store_otp(cls, email: str, purpose: str = "auth") -> str:
        """
        Generates and stores 6-digit OTP in AWS RDS PostgreSQL with 10-minute expiry.
        """
        email_clean = email.strip().lower()
        otp_code = cls.generate_otp()
        otp_id = f"otp_{secrets.token_hex(6)}"
        now = datetime.now(timezone.utc)
        expires_at = now + timedelta(minutes=10)

        stored_in_db = False
        try:
            with get_db_connection() as conn:
                with conn.cursor() as cur:
                    # Invalidate any prior unused OTPs for this email
                    cur.execute(
                        "UPDATE email_otps SET is_verified = TRUE WHERE email = %s AND is_verified = FALSE;",
                        (email_clean,)
                    )
                    cur.execute(
                        """
                        INSERT INTO email_otps (id, email, otp_code, purpose, expires_at, is_verified, created_at)
                        VALUES (%s, %s, %s, %s, %s, FALSE, %s);
                        """,
                        (otp_id, email_clean, otp_code, purpose, expires_at, now)
                    )
            stored_in_db = True
        except (DatabaseNotConfiguredError, Exception) as e:
            logger.warning(f"Could not save OTP to PostgreSQL ({e}); storing in-memory.")

        if not stored_in_db:
            _memory_otps[email_clean] = {
                "otp_code": otp_code,
                "purpose": purpose,
                "expires_at": expires_at,
                "is_verified": False
            }

        # Dispatch email
        cls.send_email_otp(email_clean, otp_code, purpose)
        return otp_code

    @classmethod
    def verify_otp(cls, email: str, otp_code: str) -> bool:
        """
        Validates the 6-digit OTP code against PostgreSQL RDS.
        Marks as verified on initial match, and accepts recently verified tokens.
        """
        email_clean = email.strip().lower()
        code_clean = otp_code.strip()
        now = datetime.now(timezone.utc)

        try:
            with get_db_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        """
                        SELECT id, otp_code, expires_at, is_verified, created_at
                        FROM email_otps
                        WHERE email = %s AND otp_code = %s
                        ORDER BY created_at DESC
                        LIMIT 1;
                        """,
                        (email_clean, code_clean)
                    )
                    row = cur.fetchone()
                    if row:
                        exp = row["expires_at"]
                        if exp.tzinfo is None:
                            exp = exp.replace(tzinfo=timezone.utc)
                        
                        # If already verified recently (within expiry window)
                        if row["is_verified"] and exp >= now:
                            return True

                        if not row["is_verified"] and exp >= now:
                            # Mark as verified
                            cur.execute(
                                "UPDATE email_otps SET is_verified = TRUE WHERE id = %s;",
                                (row["id"],)
                            )
                            return True
                        else:
                            logger.info(f"OTP expired for {email_clean}")
                            return False
        except (DatabaseNotConfiguredError, Exception) as e:
            logger.warning(f"Could not verify OTP in PostgreSQL ({e}); checking memory.")

        # Fallback memory check
        mem = _memory_otps.get(email_clean)
        if mem and mem["otp_code"] == code_clean:
            if mem["expires_at"] >= now:
                mem["is_verified"] = True
                return True

        return False


otp_service = OtpService()
