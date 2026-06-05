# AgendaApp

Sistema de agendamento desktop com Tauri + React + TypeScript + FastAPI.

## Visão geral

- Frontend: React 18 + TypeScript + Vite + Tailwind CSS
- Backend: Python 3.11+ + FastAPI + SQLAlchemy + SQLite
- Autenticação: JWT (access + refresh tokens)
- Estado global: Zustand
- Gráficos: Recharts
- Formulários: React Hook Form + Zod
- HTTP: Axios com interceptors JWT

## Estrutura do projeto

- `backend/` — API Python FastAPI
- `src/` — frontend React + TypeScript
- `src-tauri/` — Tauri desktop config

## Configuração

1. Copie os ficheiros de ambiente:
   - `backend/.env.example` → `backend/.env`
   - `/.env.example` → `/.env`

2. Instale dependências Python (no `backend/`):

```powershell
cd backend
python -m pip install -r requirements.txt
```

3. Instale dependências Node (na raiz do projeto):

```powershell
npm install
```

## Como arrancar

### Backend

```powershell
cd backend
python -m uvicorn main:app --reload
```

### Frontend

```powershell
npm run dev
```

### Tauri (desktop)

```powershell
npm run tauri
```

## Seed de dados

No `backend/`:

```powershell
python seed.py
```

### Usuários seed

- admin@app.com / admin123
- 5 clientes de teste

## Endpoints principais

- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/refresh`
- `GET /services`
- `GET /appointments/my`
- `GET /stats/overview`

## Notas

- O frontend usa `VITE_API_URL` para apontar ao backend.
- O backend aceita CORS do Tauri e do `localhost`.
- JWT e refresh tokens são geridos no estado global do frontend.
