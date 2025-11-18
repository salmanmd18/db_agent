from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from ..db import get_session
from ..models.appointments import LegacyAppointmentCreate, LegacyAppointmentResponse
from ..services import appointment_service

router = APIRouter(tags=["appointments"])


@router.post(
    "/appointments",
    response_model=LegacyAppointmentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_appointment(
    payload: LegacyAppointmentCreate,
    session: Session = Depends(get_session),
) -> LegacyAppointmentResponse:
    record = appointment_service.create_appointment(payload, session)
    return appointment_service.to_legacy_response(record)


@router.get(
    "/appointments",
    response_model=list[LegacyAppointmentResponse],
)
def list_appointments(session: Session = Depends(get_session)) -> list[LegacyAppointmentResponse]:
    records = appointment_service.list_appointments(session)
    return appointment_service.to_legacy_list(records)


@router.get(
    "/appointments/{appointment_id}",
    response_model=LegacyAppointmentResponse,
)
def get_appointment(
    appointment_id: str,
    session: Session = Depends(get_session),
) -> LegacyAppointmentResponse:
    try:
        numeric_id = int(appointment_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Appointment not found")

    record = appointment_service.get_appointment_by_id(numeric_id, session)
    if not record:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appointment_service.to_legacy_response(record)

