"""
User Authentication & OTP API Routes.
Provides signup, login, OTP dispatch & verification, profile check, and session management.
"""

from fastapi import APIRouter, status, HTTPException
from app.schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    UserProfileUpdateRequest,
    UserResponse,
    AuthResponse,
    SendOtpRequest,
    VerifyOtpRequest,
    OtpResponse
)
from app.repositories.postgres_user_repo import user_repo, hash_password
from app.services.otp_service import otp_service

router = APIRouter(prefix="/auth", tags=["User Authentication & Security"])


@router.post(
    "/send-otp",
    response_model=OtpResponse,
    status_code=status.HTTP_200_OK,
    summary="Dispatch 6-digit OTP verification code"
)
def send_otp_endpoint(payload: SendOtpRequest):
    """
    Generates a secure 6-digit OTP, stores it in PostgreSQL RDS with a 10-minute expiry,
    and sends it via email (or logs it in development/sandbox mode).
    """
    code = otp_service.create_and_store_otp(payload.email, payload.purpose or "Registration")
    return OtpResponse(
        success=True,
        email=payload.email,
        message=f"Verification code sent to {payload.email}."
    )


@router.post(
    "/verify-otp",
    response_model=OtpResponse,
    status_code=status.HTTP_200_OK,
    summary="Verify 6-digit OTP code"
)
def verify_otp_endpoint(payload: VerifyOtpRequest):
    """Validates the 6-digit OTP against PostgreSQL RDS."""
    is_valid = otp_service.verify_otp(payload.email, payload.otp_code)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code. Please request a new code."
        )
    return OtpResponse(
        success=True,
        email=payload.email,
        message="Verification code validated successfully."
    )


@router.post(
    "/signup",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new MoneyLens user account with unique username and OTP verification"
)
def signup_endpoint(payload: UserRegisterRequest):
    """Creates a new user record in AWS RDS PostgreSQL after validating email, username, and password."""
    # 1. Check if email is already taken
    existing_email = user_repo.get_by_email(payload.email)
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"An account with email '{payload.email}' already exists. Please sign in."
        )

    # 2. Check if username is already taken
    if payload.username:
        existing_username = user_repo.get_by_username(payload.username)
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Username '@{payload.username}' is already taken. Please choose another username."
            )

    # 3. If an OTP code was provided, verify it
    if payload.otp_code:
        valid_otp = otp_service.verify_otp(payload.email, payload.otp_code)
        if not valid_otp:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired OTP verification code."
            )

    # 4. Create and persist user in AWS RDS PostgreSQL
    user = user_repo.create(payload)
    token = f"ml_token_{user.id}"
    return AuthResponse(
        user=user,
        token=token,
        message="Account registered successfully in database."
    )


@router.post(
    "/login",
    response_model=AuthResponse,
    status_code=status.HTTP_200_OK,
    summary="Authenticate existing user via Email or Username"
)
def login_endpoint(payload: UserLoginRequest):
    """Validates user credentials against PostgreSQL RDS via email or username."""
    user_record = user_repo.get_by_identifier(payload.identifier)
    if not user_record:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No account found matching this email or username. Please check your credentials or create an account."
        )

    expected_hash = user_record["password_hash"]
    if hash_password(payload.password) != expected_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password. Please verify your password and try again."
        )

    user = UserResponse(
        id=user_record["id"],
        email=user_record["email"],
        username=user_record.get("username"),
        name=user_record["name"],
        monthly_income=float(user_record["monthly_income"]),
        monthly_expenses=float(user_record["monthly_expenses"]),
        current_savings=float(user_record["current_savings"]),
        health_score=int(user_record["health_score"]),
        created_at=user_record["created_at"]
    )
    token = f"ml_token_{user.id}"
    return AuthResponse(
        user=user,
        token=token,
        message="Authentication successful."
    )


@router.get(
    "/users/{user_id}",
    response_model=UserResponse,
    summary="Get user profile by ID"
)
def get_user_profile(user_id: str):
    user = user_repo.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    return user


@router.put(
    "/users/{user_id}",
    response_model=UserResponse,
    summary="Update financial parameters for user"
)
def update_user_profile(user_id: str, payload: UserProfileUpdateRequest):
    updated = user_repo.update_profile(user_id, payload)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    return updated
