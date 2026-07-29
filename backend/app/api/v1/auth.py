"""Authentication: phone-OTP registration, login, token refresh."""
from __future__ import annotations

import secrets

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.cache import cache
from app.core.database import get_session
from app.core.dependencies import get_current_user
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_password,
)
from app.models.user import User, UserProfile
from app.schemas.user import (
    LoginRequest,
    RefreshRequest,
    Token,
    UserCreate,
    UserOut,
    VerifyOtpRequest,
)
from app.services.notifications import send_otp_sms

router = APIRouter(prefix="/auth", tags=["auth"])

OTP_TTL = 600  # 10 minutes


def _generate_otp() -> str:
    return f"{secrets.randbelow(900000) + 100000}"


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(payload: UserCreate, db: AsyncSession = Depends(get_session)):
    """Register a new user and send a one-time verification code."""
    existing = await db.execute(select(User).where(User.phone == payload.phone))
    if existing.scalar_one_or_none():
        raise HTTPException(status.HTTP_409_CONFLICT, "Phone already registered")

    user = User(
        phone=payload.phone,
        name=payload.name,
        role=payload.role,
        password_hash=get_password_hash(payload.password) if payload.password else None,
    )
    user.profile = UserProfile(whatsapp=payload.phone)
    db.add(user)
    await db.commit()

    otp = _generate_otp()
    await cache.setex(f"otp:{payload.phone}", OTP_TTL, otp)
    await send_otp_sms(payload.phone, otp)
    return {"message": "OTP sent to your phone", "phone": payload.phone}


@router.post("/verify-otp", response_model=Token)
async def verify_otp(payload: VerifyOtpRequest, db: AsyncSession = Depends(get_session)):
    """Verify the OTP and issue access + refresh tokens."""
    stored = await cache.get(f"otp:{payload.phone}")
    stored_val = stored.decode() if isinstance(stored, bytes) else stored
    if not stored_val or stored_val != payload.otp:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid or expired OTP")

    result = await db.execute(
        select(User)
        .where(User.phone == payload.phone)
        .options(selectinload(User.profile))
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")

    user.is_verified = True
    await db.commit()
    await cache.delete(f"otp:{payload.phone}")

    return Token(
        access_token=create_access_token(str(user.id)),
        refresh_token=create_refresh_token(str(user.id)),
        user=UserOut.model_validate(user),
    )


@router.post("/login", response_model=Token)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_session)):
    """Phone/email + password login. Accepts local or E.164 phone format."""
    from app.schemas.common import normalize_ke_phone

    identifier = payload.identifier
    candidates = {identifier}
    try:
        candidates.add(normalize_ke_phone(identifier))
    except ValueError:
        pass  # not a phone (e.g. an email) — match as given

    result = await db.execute(
        select(User)
        .where(or_(User.phone.in_(candidates), User.email == identifier))
        .options(selectinload(User.profile))
    )
    user = result.scalar_one_or_none()
    if not user or not verify_password(payload.password, user.password_hash or ""):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid credentials")

    return Token(
        access_token=create_access_token(str(user.id)),
        refresh_token=create_refresh_token(str(user.id)),
        user=UserOut.model_validate(user),
    )


@router.post("/refresh", response_model=Token)
async def refresh(payload: RefreshRequest):
    """Exchange a refresh token for a new access token."""
    try:
        claims = decode_token(payload.refresh_token, expected_type="refresh")
    except ValueError as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, str(exc)) from exc
    sub = claims["sub"]
    return Token(
        access_token=create_access_token(sub),
        refresh_token=create_refresh_token(sub),
    )


@router.post("/logout")
async def logout(user: User = Depends(get_current_user)):
    """Best-effort logout (client discards tokens)."""
    await cache.delete(f"session:{user.id}")
    return {"message": "Logged out"}
