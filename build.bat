@echo off
setlocal enabledelayedexpansion

echo ==================================================
echo AgendaApp - Build Completo (Windows)
echo ==================================================

set "ROOT=%~dp0"
set "BACKEND=%ROOT%backend"
set "FRONTEND=%ROOT%frontend"

echo [1/4] Preparando Backend...
cd /d "%BACKEND%"
if not exist ".venv\Scripts\activate.bat" (
    echo [Erro] .venv do backend nao encontrado. Corra dev.bat primeiro para instalar dependencias.
    pause
    exit /b 1
)
call .venv\Scripts\activate.bat
pip install pyinstaller

echo [2/4] Compilando Backend com PyInstaller...
pyinstaller --name backend-api --onefile --noconsole main.py
if %errorlevel% neq 0 (
    echo [Erro] Falha ao compilar o backend.
    pause
    exit /b 1
)

echo [3/4] Copiando executavel para Tauri Sidecar...
cd /d "%FRONTEND%\src-tauri"
if not exist "bin" mkdir bin
copy /y "%BACKEND%\dist\backend-api.exe" "bin\backend-api-x86_64-pc-windows-msvc.exe"
if %errorlevel% neq 0 (
    echo [Erro] Falha ao copiar o backend para a pasta bin do Tauri.
    pause
    exit /b 1
)

echo [4/4] Compilando Frontend e Tauri...
cd /d "%FRONTEND%"
call npm run tauri:build
if %errorlevel% neq 0 (
    echo [Erro] Falha ao compilar a aplicacao Tauri.
    pause
    exit /b 1
)

echo ==================================================
echo Build Completo!
echo A aplicacao encontra-se em: frontend\src-tauri\target\release\bundle
pause
