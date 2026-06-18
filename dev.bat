@echo off
setlocal enabledelayedexpansion

set "ROOT=%~dp0"
set "BACKEND=%ROOT%backend"
set "FRONTEND=%ROOT%frontend"

echo ==================================================
echo AgendaApp - Ambiente de Desenvolvimento
echo ==================================================

echo [1/3] Iniciando backend...
cd /d "%BACKEND%"
if not exist ".venv\Scripts\activate.bat" (
  python -m venv .venv
  call .venv\Scripts\activate.bat
  pip install -r requirements.txt
) else (
  call .venv\Scripts\activate.bat
)
start "Backend" cmd /k "cd /d \"%ROOT%\" && call backend\.venv\Scripts\activate.bat && uvicorn backend.main:app --host 127.0.0.1 --port 8000"

echo Aguardando API (3s)...
timeout /t 3 /nobreak >nul

echo [2/3] Instalando dependencias Frontend...
cd /d "%FRONTEND%"
if not exist "node_modules" call npm install

echo [3/3] Iniciando Interface da Aplicacao...
:: Inicia o servidor Vite em background
start "Frontend" cmd /c "npm run dev"

echo Aguardando Interface (4s)...
timeout /t 4 /nobreak >nul

:: O truque mágico: Abre o Edge em modo "Aplicação" (sem abas, sem barra de pesquisa)
start msedge --app=http://localhost:5173 --window-size=1200,800

echo.
echo ==================================================
echo APLICACAO ABERTA!
echo Para fechar tudo, basta fechar esta janela preta.
echo ==================================================
pause
