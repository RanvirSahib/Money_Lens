"""
Pydantic Schemas for User Authentication, Profile Management, and OTP Verification.
"""

import re
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, field_validator


def validate_password_strength(password: str) -> str:
    """
    Validates password strength:
    - At least 8 characters
    - At least 1 uppercase letter
    - At least 1 lowercase letter
    - At least 1 numeric digit
    - At least 1 special character / symbol
    """
    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters long.")
    if not re.search(r"[A-Z]", password):
        raise ValueError("Password must contain at least one uppercase letter (A-Z).")
    if not re.search(r"[a-z]", password):
        raise ValueError("Password must contain at least one lowercase letter (a-z).")
    if not re.search(r"[0-9]", password):
        raise ValueError("Password must contain at least one number (0-9).")
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>\-_+=\[\]\\/`~]", password):
        raise ValueError("Password must contain at least one special character or symbol (e.g. !@#$%^&*).")
    return password


class UserRegisterRequest(BaseModel):
    email: str = Field(..., min_length=3, examples=["investor@monexa.io"])
    username: str = Field(..., min_length=3, max_length=30, pattern=r"^[a-zA-Z0-9_-]+$", examples=["ranvir_singh"])
    name: str = Field(..., min_length=2, examples=["Ranvir Singh"])
    mobile: Optional[str] = Field(default=None, max_length=20, examples=["+91 9876543210"])
    password: str = Field(..., min_length=8, examples=["SecurePass123!"])
    otp_code: Optional[str] = Field(default=None, description="6-digit verification code")
    monthly_income: Optional[float] = Field(default=0.0, ge=0, description="Monthly net income in INR (>= 0)")
    essential_expenses: Optional[float] = Field(default=0.0, ge=0, description="Essential monthly expenses in INR (>= 0)")
    discretionary_expenses: Optional[float] = Field(default=0.0, ge=0, description="Discretionary monthly expenses in INR (>= 0)")
    monthly_expenses: Optional[float] = Field(default=None, ge=0, description="Total monthly expenses in INR (>= 0)")
    current_savings: Optional[float] = Field(default=0.0, ge=0, description="Liquid cash / savings in INR (>= 0)")

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        return validate_password_strength(v)

    @field_validator("username")
    @classmethod
    def clean_username(cls, v: str) -> str:
        return v.strip().lower()


class UserLoginRequest(BaseModel):
    identifier: str = Field(..., min_length=3, description="Email or Username", examples=["ranvir_singh", "investor@monexa.io"])
    password: str = Field(..., examples=["SecurePass123!"])


class ResetPasswordRequest(BaseModel):
    email: str = Field(..., min_length=3, examples=["investor@monexa.io"])
    otp_code: str = Field(..., min_length=6, max_length=6, pattern=r"^\d{6}$", examples=["123456"])
    new_password: str = Field(..., min_length=8, examples=["SecurePass123!"])

    @field_validator("new_password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        return validate_password_strength(v)


class SendOtpRequest(BaseModel):
    email: str = Field(..., min_length=3, examples=["investor@monexa.io"])
    purpose: Optional[str] = Field(default="auth", examples=["auth", "signup", "login", "reset"])


class VerifyOtpRequest(BaseModel):
    email: str = Field(..., min_length=3, examples=["investor@monexa.io"])
    otp_code: str = Field(..., min_length=6, max_length=6, pattern=r"^\d{6}$", examples=["123456"])


class OtpResponse(BaseModel):
    success: bool
    email: str
    message: str
    sandbox_otp: Optional[str] = None  # Returned in dev/sandbox mode for testing ease


class UserProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    username: Optional[str] = None
    mobile: Optional[str] = None
    monthly_income: Optional[float] = Field(default=None, ge=0)
    essential_expenses: Optional[float] = Field(default=None, ge=0)
    discretionary_expenses: Optional[float] = Field(default=None, ge=0)
    monthly_expenses: Optional[float] = Field(default=None, ge=0)
    current_savings: Optional[float] = Field(default=None, ge=0)
    current_password: Optional[str] = None
    new_password: Optional[str] = None

    @field_validator("new_password")
    @classmethod
    def check_new_password(cls, v: Optional[str]) -> Optional[str]:
        if v:
            return validate_password_strength(v)
        return v

    @field_validator("username")
    @classmethod
    def check_username(cls, v: Optional[str]) -> Optional[str]:
        if v:
            v_clean = v.strip().lower()
            if len(v_clean) < 3 or len(v_clean) > 30 or not re.match(r"^[a-zA-Z0-9_-]+$", v_clean):
                raise ValueError("Username must be 3-30 characters with alphanumeric, underscore, or hyphen.")
            return v_clean
        return v


class UserResponse(BaseModel):
    id: str
    email: str
    username: Optional[str] = None
    name: str
    mobile: Optional[str] = None
    monthly_income: float
    monthly_expenses: float
    current_savings: float
    health_score: int
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class AuthResponse(BaseModel):
    user: UserResponse
    token: str
    message: str

