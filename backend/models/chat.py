from __future__ import annotations

from typing import Any, Dict, Optional

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    """Incoming chat payload."""

    message: str = Field(..., min_length=1, description="User supplied message text.")


class ChatResponse(BaseModel):
    """Response returned to the frontend chat widget."""

    text: str
    should_speak: bool = True
    intent: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    isSchedulingIntent: bool = False
    # Legacy field kept for the previous frontend implementation.
    answer: Optional[str] = None

