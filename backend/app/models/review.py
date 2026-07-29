"""Polymorphic reviews (listing | rental | product)."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    CheckConstraint,
    ForeignKey,
    Index,
    SmallInteger,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.types import GUID

if TYPE_CHECKING:
    from app.models.user import User


class Review(Base):
    __tablename__ = "reviews"
    __table_args__ = (
        CheckConstraint("rating BETWEEN 1 AND 5", name="ck_review_rating"),
        Index("idx_reviews_subject", "subject_id", "subject_type"),
    )

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    reviewer_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("users.id"))
    subject_id: Mapped[uuid.UUID] = mapped_column(GUID(), nullable=False)
    subject_type: Mapped[str] = mapped_column(String(20))
    rating: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    comment: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    reviewer: Mapped["User"] = relationship(back_populates="reviews")
