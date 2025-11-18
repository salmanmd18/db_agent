from __future__ import annotations

import logging

import httpx
from fastapi import HTTPException

from ..config import DEFAULT_ELEVEN_VOICE_ID, get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


async def synthesize_speech(text: str, voice_id: str | None = None) -> bytes:
    """Call the ElevenLabs TTS REST API and return MP3 bytes for the provided text."""

    api_key = settings.elevenlabs_api_key
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="ELEVENLABS_API_KEY is not configured on the server.",
        )

    voice = voice_id or settings.elevenlabs_default_voice_id or DEFAULT_ELEVEN_VOICE_ID
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice}"
    payload = {
        "text": text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability": 0.55,
            "similarity_boost": 0.75,
        },
    }

    headers = {
        "xi-api-key": api_key,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg",
    }

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(url, headers=headers, json=payload)

    if response.status_code != 200:
        logger.warning(
            "ElevenLabs TTS failed (%s): %s", response.status_code, response.text
        )
        raise HTTPException(status_code=502, detail="Upstream TTS service failed.")

    return response.content

