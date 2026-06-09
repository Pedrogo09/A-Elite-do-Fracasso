@echo off
chcp 65001 >nul
title A-Elite-do-Fracasso - A iniciar...

echo.
echo ========================================
echo    A-Elite-do-Fracasso - Iniciar
echo ========================================
echo.
echo A iniciar Backend FastAPI...
start "Backend FastAPI" cmd /k "cd /d "%~dp0backend" && call .venv\Scripts\activate.bat && python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000"

timeout /t 3 /nobreak >nul

echo A iniciar Frontend Tauri...
start "Frontend Tauri" cmd /k "cd /d "%~dp0frontend" && npm run tauri"

echo.
echo As duas janelas foram abertas. Aguarda alguns segundos ate a aplicacao aparecer.
pause