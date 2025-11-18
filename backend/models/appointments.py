from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict
from sqlmodel import Field, SQLModel


class AppointmentBase(SQLModel):
    """Fields shared between table rows and API responses."""

    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    location: Optional[str] = None
    service_type: Optional[str] = Field(default=None, description="Internal service type label.")
    vehicle_make: Optional[str] = None
    vehicle_model: Optional[str] = None
    vehicle_year: Optional[str] = None
    preferred_date: Optional[str] = None
    preferred_time: Optional[str] = None
    notes: Optional[str] = None


class Appointment(AppointmentBase, table=True):
    """SQLModel table storing appointment requests."""

    __tablename__ = "appointments"

    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)


class AppointmentCreate(AppointmentBase):
    """New-style create payload (snake_case)."""

    pass


class AppointmentRead(AppointmentBase):
    """New-style response (snake_case)."""

    id: int
    created_at: datetime


class LegacyAppointmentCreate(BaseModel):
    """
    Legacy request payload used by the current frontend (camelCase fields).

    Additional optional fields (phone, email, vehicle info) allow future enhancements
    without breaking the existing contract.
    """

    name: str
    location: Optional[str] = None
    serviceType: Optional[str] = None
    preferredDate: Optional[str] = None
    preferredTime: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    vehicleMake: Optional[str] = None
    vehicleModel: Optional[str] = None
    vehicleYear: Optional[str] = None
    notes: Optional[str] = None

    model_config = ConfigDict(extra="allow")


class LegacyAppointmentResponse(LegacyAppointmentCreate):
    """Response model mirroring the previous JSON file format."""

    id: str
    createdAt: datetime

