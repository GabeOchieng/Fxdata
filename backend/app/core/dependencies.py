"""Reusable FastAPI dependencies: auth, current user, role guards."""
from __future__ import annotations

from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_session
from app.core.security import decode_token
from app.models.user import User, UserRole
from sqlalchemy import select

bearer = HTTPBearer(auto_error=False)


async def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: AsyncSession = Depends(get_session),
) -> User:
    if creds is None:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED, "Authentication required"
        )
    try:
        payload = decode_token(creds.credentials, expected_type="access")
    except ValueError as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, str(exc)) from exc

    user_id = payload.get("sub")
    result = await db.execute(
        select(User)
        .where(User.id == UUID(user_id))
        .options(selectinload(User.profile))
    )
    user = result.scalar_one_or_none()
    if user is None or not user.is_active:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found or inactive")
    return user


def require_role(*roles: UserRole):
    """Dependency factory guarding an endpoint to specific roles."""

    async def _guard(user: User = Depends(get_current_user)) -> User:
        if user.role not in roles and user.role != UserRole.admin:
            raise HTTPException(
                status.HTTP_403_FORBIDDEN,
                f"Requires role: {', '.join(r.value for r in roles)}",
            )
        return user

    return _guard
