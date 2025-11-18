from __future__ import annotations

import os
from pathlib import Path
from typing import Generator

from sqlmodel import Session, SQLModel, create_engine

from .config import get_settings


def _build_engine():
    settings = get_settings()
    database_url = settings.database_url
    connect_args: dict = {}

    if database_url.startswith("sqlite"):
        Path("data").mkdir(exist_ok=True)
        connect_args["check_same_thread"] = False

    engine = create_engine(database_url, connect_args=connect_args)
    return engine


engine = _build_engine()


def create_db_and_tables() -> None:
    """Create all SQLModel tables (idempotent)."""

    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """FastAPI dependency that yields a SQLModel session."""

    with Session(engine) as session:
        yield session
