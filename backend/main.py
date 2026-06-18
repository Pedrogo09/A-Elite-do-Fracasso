import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Determinar o diretório base (funciona tanto em desenvolvimento como compilado com PyInstaller)
if getattr(sys, 'frozen', False):
    basedir = os.path.dirname(sys.executable)
else:
    basedir = os.path.dirname(__file__)

load_dotenv(os.path.join(basedir, ".env"))

# Importações absolutas — o uvicorn é sempre lançado da raiz com backend.main:app
# Para PyInstaller (executável standalone), usamos sys.path para garantir que encontra os módulos
if getattr(sys, 'frozen', False):
    # Executável compilado: adicionar o diretório do executável ao sys.path
    if basedir not in sys.path:
        sys.path.insert(0, basedir)
    import database
    import models
    from routers import auth, users, services, appointments, stats
else:
    # Desenvolvimento: importações relativas ao pacote backend
    from . import database, models
    from .routers import auth, users, services, appointments, stats

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="AgendaApp API")

origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()]
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
