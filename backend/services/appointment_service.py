from __future__ import annotations

from typing import List, Optional

from sqlmodel import Session, select

from ..models.appointments import (
    Appointment,
    AppointmentCreate,
    LegacyAppointmentCreate,
    LegacyAppointmentResponse,
)


def _coerce_create_payload(payload: LegacyAppointmentCreate) -> AppointmentCreate:
    """Map the legacy camelCase payload into our SQLModel create schema."""

    return AppointmentCreate(
        name=payload.name,
        location=payload.location,
        service_type=payload.serviceType,
        preferred_date=payload.preferredDate,
        preferred_time=payload.preferredTime,
        phone=payload.phone,
        email=payload.email,
        vehicle_make=payload.vehicleMake,
        vehicle_model=payload.vehicleModel,
        vehicle_year=payload.vehicleYear,
        notes=payload.notes,
    )


def create_appointment(
    payload: LegacyAppointmentCreate,
    session: Session,
) -> Appointment:
    """Persist a new appointment request."""

    to_store = _coerce_create_payload(payload).model_dump()
    appointment = Appointment(**to_store)
    session.add(appointment)
    session.commit()
    session.refresh(appointment)
    return appointment


def get_appointment_by_id(appointment_id: int, session: Session) -> Optional[Appointment]:
    """Fetch an appointment by its database ID."""

    return session.get(Appointment, appointment_id)


def list_appointments(session: Session) -> List[Appointment]:
    """Return all appointments ordered by creation time (newest first)."""

    statement = select(Appointment).order_by(Appointment.created_at.desc())
    return list(session.exec(statement))


def to_legacy_response(appointment: Appointment) -> LegacyAppointmentResponse:
    """Convert a database row into the legacy response structure."""

    return LegacyAppointmentResponse(
        id=str(appointment.id),
        createdAt=appointment.created_at,
        name=appointment.name,
        location=appointment.location,
        serviceType=appointment.service_type,
        preferredDate=appointment.preferred_date,
        preferredTime=appointment.preferred_time,
        phone=appointment.phone,
        email=appointment.email,
        vehicleMake=appointment.vehicle_make,
        vehicleModel=appointment.vehicle_model,
        vehicleYear=appointment.vehicle_year,
        notes=appointment.notes,
    )


def to_legacy_list(appointments: List[Appointment]) -> List[LegacyAppointmentResponse]:
    return [to_legacy_response(item) for item in appointments]
