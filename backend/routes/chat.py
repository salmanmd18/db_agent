from __future__ import annotations

from fastapi import APIRouter

from ..models.chat import ChatRequest, ChatResponse
from ..services.chat_service import handle_chat_message

router = APIRouter(tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(payload: ChatRequest) -> ChatResponse:
    result = await handle_chat_message(payload.message)
    return ChatResponse(
        text=result.answer,
        should_speak=result.should_speak,
        intent=result.intent,
        metadata=result.metadata,
        isSchedulingIntent=result.is_scheduling_intent,
        answer=result.answer,
    )
