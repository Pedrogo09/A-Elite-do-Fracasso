@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

set "TEMP_DIR=%TEMP%"

echo ==========================================
echo   Verificando dependencias...
echo ==========================================

:: Detect Node.js and npm
set "NODE_CMD="
where node >nul 2>nul
if !errorlevel! equ 0 (
  where npm >nul 2>nul
  if !errorlevel! equ 0 set "NODE_CMD=node"
)

if "%NODE_CMD%"=="" (
  if exist "%USERPROFILE%\.node-portable" (
    for /d %%i in ("%USERPROFILE%\.node-portable\node-*") do (
      if exist "%%i\node.exe" if exist "%%i\npm.cmd" (
        set "PATH=!PATH!;%%i"
        set "NODE_CMD=node"
      ) else (
        echo [!] Pasta portable incompleta em %%i. Removendo...
        rmdir /s /q "%%i"
      )
    )
  )
)

if "%NODE_CMD%"=="" (
  echo [!] Node.js ou npm nao encontrado. Baixando Node.js portable...
  powershell -NoProfile -Command "$ProgressPreference='SilentlyContinue'; Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.18.0/node-v20.18.0-win-x64.zip' -OutFile '%TEMP_DIR%\node.zip'"
  if exist "%TEMP_DIR%\node.zip" (
    if not exist "%USERPROFILE%\.node-portable" mkdir "%USERPROFILE%\.node-portable"
    echo [*] Extraindo Node.js...
    powershell -NoProfile -Command "$ProgressPreference='SilentlyContinue'; Expand-Archive -Path '%TEMP_DIR%\node.zip' -DestinationPath '%USERPROFILE%\.node-portable' -Force"
    for /d %%i in ("%USERPROFILE%\.node-portable\node-*") do (
      if exist "%%i\node.exe" if exist "%%i\npm.cmd" (
        set "PATH=!PATH!;%%i"
        set "NODE_CMD=node"
      )
    )
    del /f /q "%TEMP_DIR%\node.zip"
  )
)

:: Detect Python
set "PYTHON_CMD="
set "PYTHON_PATH="
echo [*] Verificando Python...

where py >nul 2>nul
if !errorlevel! equ 0 (
  py -c "print('OK')" >nul 2>nul
  if !errorlevel! equ 0 set "PYTHON_CMD=py"
)

if "%PYTHON_CMD%"=="" (
  where python >nul 2>nul
  if !errorlevel! equ 0 (
    python -c "print('OK')" >nul 2>nul
    if !errorlevel! equ 0 set "PYTHON_CMD=python"
  )
)

if "%PYTHON_CMD%"=="" (
  echo [*] Procurando Python em pastas...
  for %%d in ("%LOCALAPPDATA%\Programs\Python" "C:\Program Files\Python") do (
    if exist "%%~d" (
      for /f "delims=" %%f in ('dir /s /b "%%~d\python.exe" 2^>nul') do (
        "%%f" -c "print('OK')" >nul 2>nul
        if !errorlevel! equ 0 (
          set "PYTHON_PATH=%%~dpF"
          set "PYTHON_CMD=%%f"
          goto found_python
        )
      )
    )
  )
)

:found_python

if "%PYTHON_CMD%"=="" (
  echo [!] Python nao encontrado. Baixando...
  powershell -NoProfile -Command "Invoke-WebRequest -Uri 'https://www.python.org/ftp/python/3.12.7/python-3.12.7-amd64.exe' -OutFile '%TEMP_DIR%\python_installer.exe'"
  if exist "%TEMP_DIR%\python_installer.exe" (
    echo.
    echo ======================================== 
    echo   IMPORTANTE: Configuracao do Python
    echo ========================================
    echo.
    echo Na janela do instalador do Python:
    echo   1. Marque "Add Python 3.12 to PATH"
    echo   2. Selecione "Install for current user" (SEM admin)
    echo   3. Clique "Install"
    echo.
    echo O script vai reiniciar automaticamente apos a instalacao.
    echo.
    pause
    start /wait "" "%TEMP_DIR%\python_installer.exe" /currentuser
    del /f /q "%TEMP_DIR%\python_installer.exe"
    echo [*] Python instalado. A reiniciar o script...
    timeout /t 2 /nobreak
    exit /b 0
  )
)

if "%PYTHON_CMD%"=="" (
  echo [ERRO] Python nao foi encontrado.
  echo Instale manualmente de https://www.python.org/downloads/
  pause
  exit /b 1
)

if not "%PYTHON_PATH%"=="" (
  set "PATH=!PATH!;!PYTHON_PATH!;!PYTHON_PATH!Scripts"
)

echo ==========================================
echo       Iniciando E-Materia Hub
echo ==========================================

:: Backend
if not exist "backend" (
  echo [ERRO] Pasta backend nao encontrada!
  pause
  exit /b 1
)
cd backend

echo [1/2] Configurando backend...
if not exist ".venv" (
  echo [*] Criando ambiente virtual...
  "%PYTHON_CMD%" -m venv .venv
)
if not exist ".venv\Scripts\activate.bat" (
  echo [ERRO] Falha ao criar ambiente virtual.
  pause
  exit /b 1
)
call .venv\Scripts\activate.bat

echo [*] Instalando dependencias do backend...
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
if errorlevel 1 (
  echo [ERRO] Falha instalando dependencias.
  pause
  exit /b 1
)

echo [*] Rodando migracoes...
python manage.py makemigrations --noinput
python manage.py migrate --noinput

echo [*] Iniciando backend...
start "Backend" cmd /k "call .venv\Scripts\activate.bat && python manage.py runserver 127.0.0.1:8000"

:: Frontend
cd ..
if not exist "frontend" (
  echo [ERRO] Pasta frontend nao encontrada!
  pause
  exit /b 1
)
cd frontend

echo [2/2] Configurando frontend...
if not exist "node_modules" (
  echo [*] Instalando dependencias do frontend...
  npm install
)
start "Frontend" npm run dev
start "Frontend2" npm run dev2

echo ==========================================
echo PROJETO INICIADO COM SUCESSO!
echo Backend: http://127.0.0.1:8000
echo Frontend 1: http://localhost:8080
echo Frontend 2: http://localhost:8081
pause



