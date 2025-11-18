from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from .config import get_settings
from .db import create_db_and_tables
from .routes.appointments import router as appointments_router
from .routes.chat import router as chat_router
from .routes.tts import router as tts_router

settings = get_settings()
app = FastAPI(title="Dobbs AI Service Assistant", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    create_db_and_tables()


for prefix in ("/api", "/api/v1"):
    app.include_router(chat_router, prefix=prefix)
    app.include_router(appointments_router, prefix=prefix)

app.include_router(tts_router)
app.include_router(tts_router, prefix="/api/v1")


@app.get("/health", tags=["system"])
async def health() -> dict:
    return {"ok": True}


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
