"""Shared schema helpers."""
from __future__ import annotations

from typing import Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class Page(BaseModel, Generic[T]):
    """Envelope for paginated list responses."""

    items: list[T]
    total: int
    page: int
    size: int

    @property
    def pages(self) -> int:
        return (self.total + self.size - 1) // self.size if self.size else 0


def normalize_ke_phone(value: str) -> str:
    """Validate and normalise a Kenyan phone number to E.164 (+2547XXXXXXXX)."""
    import phonenumbers

    try:
        parsed = phonenumbers.parse(value, "KE")
        if not phonenumbers.is_valid_number(parsed):
            raise ValueError
        return phonenumbers.format_number(
            parsed, phonenumbers.PhoneNumberFormat.E164
        )
    except Exception as exc:  # noqa: BLE001
        raise ValueError("Invalid Kenyan phone number") from exc
