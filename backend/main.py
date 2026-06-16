import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os as _os

# Load backend .env explicitly (works when running from project root)
basedir = _os.path.dirname(__file__)
load_dotenv(_os.path.join(basedir, ".env"))

# Flexible imports so app can be run as module or as script
try:
    from .database import engine
    from . import models
    from .routers import auth, users, services, appointments, stats
    models.Base.metadata.create_all(bind=engine)
except Exception:
    # fallback when executed as script: python backend/main.py
    import database as _database
    engine = _database.engine
    import models
    from routers import auth, users, services, appointments, stats
    models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AgendaApp API")

origins = [origin.strip() for origin in os.getenv("CORS_ORIGINS", "").split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(services.router)
app.include_router(appointments.router)
app.include_router(stats.router)


@app.get("/", tags=["health"])
def health_check():
    return {"status": "ok", "message": "AgendaApp backend está a funcionar"}
