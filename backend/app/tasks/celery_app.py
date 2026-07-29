"""Celery application — async task queue backed by Redis."""
from __future__ import annotations

from celery import Celery

from app.core.config import settings

celery_app = Celery(
    "kazihub",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.tasks.jobs"],
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="Africa/Nairobi",
    enable_utc=True,
    task_default_queue="default",
    task_routes={
        "send_order_confirmation": {"queue": "notifications"},
        "send_rental_enquiry": {"queue": "notifications"},
    },
)
