"""Current-user profile endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.core.dependencies import get_current_user
from app.models.user import User, UserProfile
from app.schemas.user import ProfileOut, UserOut

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserOut)
async def me(user: User = Depends(get_current_user)):
    return user


@router.put("/me/profile", response_model=ProfileOut)
async def update_profile(
    payload: ProfileOut,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    profile = user.profile or UserProfile(user_id=user.id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
    if user.profile is None:
        db.add(profile)
    await db.commit()
    await db.refresh(profile)
    return profile
