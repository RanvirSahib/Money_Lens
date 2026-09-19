"""
Pydantic Schemas for User Authentication and Profile Management.
"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class UserRegisterRequest(BaseModel):
    email: str = Field(..., min_length=3, examples=["investor@moneylens.io"])
    name: str = Field(..., min_length=2, examples=["Ranvir Singh"])
    password: str = Field(..., min_length=4, examples=["SecurePass123!"])
    monthly_income: Optional[float] = Field(default=85000.0, ge=0)
    monthly_expenses: Optional[float] = Field(default=35000.0, ge=0)
    current_savings: Optional[float] = Field(default=150000.0, ge=0)


class UserLoginRequest(BaseModel):
    email: str = Field(..., min_length=3, examples=["investor@moneylens.io"])
    password: str = Field(..., examples=["SecurePass123!"])


class UserProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    monthly_income: Optional[float] = Field(default=None, ge=0)
    monthly_expenses: Optional[float] = Field(default=None, ge=0)
    current_savings: Optional[float] = Field(default=None, ge=0)


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
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
