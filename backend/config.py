from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache
from typing import List

DEFAULT_ELEVEN_VOICE_ID = "YOUR_DEFAULT_VOICE_ID_HERE"


@dataclass(frozen=True)
class Settings:
    """Centralized environment configuration for the Dobbs backend."""

    app_origin: str
    database_url: str
    elevenlabs_api_key: str | None
    elevenlabs_default_voice_id: str

    @property
    def allowed_origins(self) -> List[str]:
        defaults = [
            "http://localhost",
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ]
        if self.app_origin and self.app_origin not in defaults:
            defaults.append(self.app_origin)
        return defaults


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings(
        app_origin=os.getenv("APP_ORIGIN", "http://localhost:5173"),
        database_url=os.getenv("DATABASE_URL", "sqlite:///./data/app.db"),
        elevenlabs_api_key=os.getenv("ELEVENLABS_API_KEY"),
        elevenlabs_default_voice_id=os.getenv(
            "ELEVENLABS_VOICE_ID", DEFAULT_ELEVEN_VOICE_ID
        ),
    )
