from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    message: str = Field(min_length=1, description="User supplied message text.")


class ChatResponse(BaseModel):
    answer: str
    isSchedulingIntent: bool = False


class InsertAppointment(BaseModel):
    name: str
    location: str
    serviceType: str
    preferredDate: str
    preferredTime: str


class Appointment(InsertAppointment):
    id: str
    createdAt: datetime

