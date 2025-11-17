from __future__ import annotations

import os
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from .config import get_settings
from .faq import detect_scheduling_intent, search_faq
from .llm import generate_llm_response
from .models import Appointment, ChatMessage, ChatResponse, InsertAppointment
from .routes.tts import router as tts_router
from .storage import AppointmentStorage

settings = get_settings()
app = FastAPI(title="Dobbs AI Service Assistant", version="2.0.0")
storage = AppointmentStorage()
app.include_router(tts_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["system"])
async def health() -> dict:
    return {"ok": True}


@app.post("/api/chat", response_model=ChatResponse, tags=["chat"])
async def handle_chat(payload: ChatMessage) -> ChatResponse:
    faq_match = search_faq(payload.message)
    if faq_match:
        return ChatResponse(
            answer=faq_match.answer,
            isSchedulingIntent=detect_scheduling_intent(payload.message),
        )

    return await generate_llm_response(payload.message)


@app.post(
    "/api/appointments",
    response_model=Appointment,
    status_code=201,
    tags=["appointments"],
)
async def create_appointment(payload: InsertAppointment) -> Appointment:
    return await storage.create_appointment(payload)


@app.get("/api/appointments", response_model=list[Appointment], tags=["appointments"])
async def list_appointments() -> list[Appointment]:
    return await storage.get_all()


@app.get(
    "/api/appointments/{appointment_id}",
    response_model=Appointment,
    tags=["appointments"],
)
async def get_appointment(appointment_id: str) -> Appointment:
    appointment = await storage.get_one(appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appointment


dist_dir = Path("dist/public")
if dist_dir.exists():
    app.mount(
        "/",
        StaticFiles(directory=dist_dir, html=True),
        name="client-app",
    )
else:

    @app.get("/", include_in_schema=False)
    async def root_notice() -> JSONResponse:
        return JSONResponse(
            {
                "message": "Client build not found. Run `npm run build` to generate dist/public or use Vite dev server on port 5173.",
            }
        )


@app.get("/{full_path:path}", include_in_schema=False)
async def spa_fallback(full_path: str):
    if not dist_dir.exists():
        raise HTTPException(status_code=404, detail="Not found")

    target = dist_dir / full_path
    if target.exists() and target.is_file():
        return FileResponse(target)

    index_file = dist_dir / "index.html"
    if index_file.exists():
        return FileResponse(index_file)

    raise HTTPException(status_code=404, detail="Static build missing index.html")
