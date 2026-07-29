"""User & profile models."""
from __future__ import annotations

import enum
import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Enum as SAEnum, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin
from app.models.types import GUID

if TYPE_CHECKING:
    from app.models.order import Order
    from app.models.product import Product
    from app.models.rental import Rental
    from app.models.review import Review
    from app.models.service import ServiceListing


class UserRole(str, enum.Enum):
    buyer = "buyer"
    seller = "seller"
    admin = "admin"
    caretaker = "caretaker"


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    phone: Mapped[str | None] = mapped_column(String(20), unique=True, index=True)
    email: Mapped[str | None] = mapped_column(String(255), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        SAEnum(UserRole, name="user_role"), default=UserRole.buyer, nullable=False
    )
    password_hash: Mapped[str | None] = mapped_column(Text)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    profile: Mapped["UserProfile"] = relationship(
        back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    listings: Mapped[list["ServiceListing"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    rentals: Mapped[list["Rental"]] = relationship(
        back_populates="owner", cascade="all, delete-orphan"
    )
    products: Mapped[list["Product"]] = relationship(
        back_populates="seller", cascade="all, delete-orphan"
    )
    orders: Mapped[list["Order"]] = relationship(back_populates="buyer")
    reviews: Mapped[list["Review"]] = relationship(back_populates="reviewer")


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("users.id", ondelete="CASCADE"), unique=True
    )
    bio: Mapped[str | None] = mapped_column(Text)
    avatar_url: Mapped[str | None] = mapped_column(Text)
    location: Mapped[str | None] = mapped_column(String(255))
    area: Mapped[str | None] = mapped_column(String(100))
    whatsapp: Mapped[str | None] = mapped_column(String(20))
    xp: Mapped[int] = mapped_column(Integer, default=0)
    jobs_done: Mapped[int] = mapped_column(Integer, default=0)
    rating: Mapped[float] = mapped_column(Numeric(3, 2), default=0)
    review_count: Mapped[int] = mapped_column(Integer, default=0)
    response_time: Mapped[str | None] = mapped_column(String(50))

    user: Mapped["User"] = relationship(back_populates="profile")
