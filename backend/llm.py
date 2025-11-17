from __future__ import annotations

from .faq import detect_scheduling_intent
from .models import ChatResponse

FALLBACK_ANSWER = (
    "Thanks for reaching out! Dobbs Tire & Auto Centers handles tires, brakes, alignments, "
    "oil changes, batteries, and more across 50+ St. Louis locations. Prices and availability "
    "vary by store, but I can help collect a few details and have our team follow up. Would you "
    "like to start an appointment request?"
)


async def generate_llm_response(message: str) -> ChatResponse:
    return ChatResponse(
        answer=FALLBACK_ANSWER,
        isSchedulingIntent=detect_scheduling_intent(message),
    )
