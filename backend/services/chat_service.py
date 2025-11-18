from __future__ import annotations

from typing import Any, Dict, Optional

from pydantic import BaseModel, Field

from ..faq import detect_scheduling_intent, search_faq
from ..llm import generate_llm_response


class ChatResult(BaseModel):
    """Structured result returned by the chat service."""

    answer: str
    should_speak: bool = True
    intent: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    is_scheduling_intent: bool = False


async def handle_chat_message(message: str) -> ChatResult:
    """Resolve a user message into a response using FAQ + fallback logic."""

    faq_match = search_faq(message)
    if faq_match:
        intent = "schedule" if detect_scheduling_intent(message) else None
        return ChatResult(
            answer=faq_match.answer,
            is_scheduling_intent=bool(intent),
            intent=intent,
        )

    fallback = await generate_llm_response(message)
    intent = "schedule" if fallback.isSchedulingIntent else None
    assistant_text = fallback.text or fallback.answer or ""

    return ChatResult(
        answer=assistant_text,
        is_scheduling_intent=fallback.isSchedulingIntent,
        intent=intent,
    )
