"""User / auth request & response schemas."""
from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel, EmailStr, field_validator

from app.models.user import UserRole
from app.schemas.common import normalize_ke_phone


class UserCreate(BaseModel):
    phone: str
    name: str
    password: str | None = None
    role: UserRole = UserRole.buyer

    @field_validator("phone")
    @classmethod
    def _phone(cls, v: str) -> str:
        return normalize_ke_phone(v)


class LoginRequest(BaseModel):
    identifier: str  # phone or email
    password: str


class VerifyOtpRequest(BaseModel):
    phone: str
    otp: str

    @field_validator("phone")
    @classmethod
    def _phone(cls, v: str) -> str:
        return normalize_ke_phone(v)


class ProfileOut(BaseModel):
    model_config = {"from_attributes": True}
    bio: str | None = None
    avatar_url: str | None = None
    location: str | None = None
    area: str | None = None
    whatsapp: str | None = None
    xp: int = 0
    jobs_done: int = 0
    rating: float = 0
    review_count: int = 0
    response_time: str | None = None


class UserOut(BaseModel):
    model_config = {"from_attributes": True}
    id: UUID
    phone: str | None = None
    email: EmailStr | None = None
    name: str
    role: UserRole
    is_verified: bool
    profile: ProfileOut | None = None


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserOut | None = None


class RefreshRequest(BaseModel):
    refresh_token: str
