"""Application configuration, loaded from environment / .env."""
from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    # ── Core ───────────────────────────────────────────────
    APP_NAME: str = "KaziHub API"
    ENV: str = "development"
    DEBUG: bool = True
    BASE_URL: str = "http://localhost:8000"
    SECRET_KEY: str = "change-me-in-production-please-32chars-min"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    ALGORITHM: str = "HS256"

    # ── Data stores ────────────────────────────────────────
    # asyncpg in prod; falls back to a local sqlite file for dev/tests.
    DATABASE_URL: str = "sqlite+aiosqlite:///./kazihub.db"
    REDIS_URL: str = "redis://localhost:6379/0"

    # ── CORS ───────────────────────────────────────────────
    CORS_ORIGINS: list[str] = Field(
        default=[
            "http://localhost:8000",
            "http://localhost:5500",
            "https://kazihub.co.ke",
            "https://app.kazihub.co.ke",
        ]
    )

    # ── Frontend ───────────────────────────────────────────
    # Serve the static HTML frontend from the API when set.
    SERVE_FRONTEND: bool = True
    FRONTEND_DIR: str = "../frontend"

    # ── M-Pesa (Safaricom Daraja) ──────────────────────────
    MPESA_ENV: str = "sandbox"  # sandbox | production
    MPESA_CONSUMER_KEY: str = ""
    MPESA_CONSUMER_SECRET: str = ""
    MPESA_SHORTCODE: str = "174379"
    MPESA_PASSKEY: str = ""

    # ── WhatsApp Business Cloud API ────────────────────────
    WA_TOKEN: str = ""
    WA_PHONE_ID: str = ""

    # ── SMS (Africa's Talking) / Email (SendGrid) ─────────
    AT_USERNAME: str = "sandbox"
    AT_API_KEY: str = ""
    SENDGRID_API_KEY: str = ""

    @property
    def is_postgres(self) -> bool:
        return self.DATABASE_URL.startswith("postgresql")

    @property
    def mpesa_base(self) -> str:
        return (
            "https://api.safaricom.co.ke"
            if self.MPESA_ENV == "production"
            else "https://sandbox.safaricom.co.ke"
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
