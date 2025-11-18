from __future__ import annotations

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from ..tts.elevenlabs_client import synthesize_speech

router = APIRouter(prefix="/tts", tags=["tts"])


class TTSRequest(BaseModel):
    """Payload accepted by the ElevenLabs-backed TTS endpoint."""

    text: str = Field(..., max_length=2000)
    voice_id: str | None = None


# Example request payload:
# {
#   "text": "Your Dobbs assistant message here",
#   "voice_id": "optional_custom_voice_id"
# }
# The response is an audio/mpeg stream suitable for playback in an <audio> tag.
@router.post("", response_class=StreamingResponse)
async def tts_endpoint(payload: TTSRequest):
    if not payload.text.strip():
        raise HTTPException(status_code=400, detail="Text must not be empty.")

    try:
        audio_bytes = await synthesize_speech(
            text=payload.text,
            voice_id=payload.voice_id,
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"TTS generation failed: {exc}") from exc

    return StreamingResponse(
        iter([audio_bytes]),
        media_type="audio/mpeg",
        headers={"Content-Disposition": 'inline; filename="dobbs_tts_response.mp3"'},
    )

