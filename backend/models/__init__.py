"""Pydantic and SQLModel schemas used across the backend."""

from .appointments import (
    Appointment,
    AppointmentBase,
    AppointmentCreate,
    AppointmentRead,
    LegacyAppointmentCreate,
    LegacyAppointmentResponse,
)
from .chat import ChatRequest, ChatResponse

__all__ = [
    "Appointment",
    "AppointmentBase",
    "AppointmentCreate",
    "AppointmentRead",
    "LegacyAppointmentCreate",
    "LegacyAppointmentResponse",
    "ChatRequest",
    "ChatResponse",
]
