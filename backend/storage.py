from __future__ import annotations

import asyncio
import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional

from .models import Appointment, InsertAppointment


class AppointmentStorage:
    """
    Lightweight persistence layer that mirrors the previous TypeScript MemStorage.

    Appointments are cached in memory for fast responses and written to
    `leads/appointments.json` so existing tooling continues to work.
    """

    def __init__(self) -> None:
        self._appointments: Dict[str, Appointment] = {}
        self._lock = asyncio.Lock()
        leads_dir = Path("leads")
        leads_dir.mkdir(parents=True, exist_ok=True)
        self._file_path = leads_dir / "appointments.json"
        self._load_existing_records()

    def _load_existing_records(self) -> None:
        if not self._file_path.exists():
            self._file_path.write_text("[]", encoding="utf-8")
            return

        try:
            raw_content = self._file_path.read_text(encoding="utf-8")
            payload = json.loads(raw_content)
            for record in payload:
                created_at = record.get("createdAt")
                if isinstance(created_at, str):
                    try:
                        record["createdAt"] = datetime.fromisoformat(created_at)
                    except ValueError:
                        record["createdAt"] = datetime.now(timezone.utc)
                appointment = Appointment(**record)
                self._appointments[appointment.id] = appointment
        except Exception as exc:  # pragma: no cover - defensive logging
            print(f"[storage] Failed to load appointments: {exc}")

    async def _persist(self) -> None:
        def _write() -> None:
            serialized = [
                {
                    **appointment.dict(),
                    "createdAt": appointment.createdAt.isoformat(),
                }
                for appointment in self._appointments.values()
            ]
            self._file_path.write_text(json.dumps(serialized, indent=2), encoding="utf-8")

        await asyncio.to_thread(_write)

    async def create_appointment(self, payload: InsertAppointment) -> Appointment:
        async with self._lock:
            appointment = Appointment(
                id=str(uuid.uuid4()),
                createdAt=datetime.now(timezone.utc),
                **payload.dict(),
            )
            self._appointments[appointment.id] = appointment
            await self._persist()
            return appointment

    async def get_all(self) -> List[Appointment]:
        return list(self._appointments.values())

    async def get_one(self, appointment_id: str) -> Optional[Appointment]:
        return self._appointments.get(appointment_id)

