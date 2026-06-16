@echo off
SETLOCAL ENABLEDELAYEDEXPANSION

rem AgendaApp - Start and installer script
rem This script attempts to install missing system components using winget when available.
rem It creates/activates a Python venv, installs Python requirements and npm deps, runs seed,
rem starts the backend (uvicorn) and launches the Tauri desktop app.

set "ROOT=%~dp0"
set "BACKEND=%ROOT%backend"
set "FRONTEND=%ROOT%frontend"

rem Support diagnostic mode: iniciar.bat --diagnostico
set "DIAGFILE=%ROOT%diagnostico.txt"
if "%~1"=="--diagnostico" goto DIAGNOSTICO

echo ==================================================
echo AgendaApp - Setup e Arranque (Windows)
echo ==================================================

goto :main

:main

rem Detect winget
where winget >nul 2>&1
if %errorlevel%==0 (set HAVE_WINGET=1) else (set HAVE_WINGET=0)

echo [1/9] Verificando ferramentas de sistema (python, pip, node, npm, cargo, git, webview2)...

rem Check Python (py or python)
set "PY_CMD="
where py >nul 2>&1 && set PY_CMD=py
if not defined PY_CMD where python >nul 2>&1 && set PY_CMD=python
if not defined PY_CMD (
  if %HAVE_WINGET%==1 (
    echo Python nao encontrado. Instalando via winget...
    winget install --silent --accept-package-agreements --accept-source-agreements Python.Python.3 -e || call :on_error "Instalacao Python falhou" "winget install Python" "system"
    set PY_CMD=python
  ) else (
    call :on_error "Python nao encontrado e winget indisponivel" "where python" "system"
  )
)

for /f "usebackq tokens=*" %%v in (`%PY_CMD% --version 2^>nul`) do set PYVER=%%v
echo Python: %PYVER%

rem Ensure pip
%PY_CMD% -m pip --version >nul 2>&1 || (%PY_CMD% -m ensurepip --upgrade >nul 2>&1 || %PY_CMD% -m pip install --upgrade pip >nul 2>&1)

rem Check Node/npm
where node >nul 2>&1 || (
  if %HAVE_WINGET%==1 (
    echo Node.js nao encontrado. Instalando Node LTS via winget...
    winget install --silent --accept-package-agreements --accept-source-agreements OpenJS.NodeJS.LTS -e || echo "winget install node falhou"
  ) else (
    echo Aviso: Node.js nao encontrado. Instale manualmente: https://nodejs.org
  )
)
where npm >nul 2>&1 || call :on_error "npm nao encontrado" "where npm" "system"
for /f "usebackq tokens=*" %%v in (`node --version 2^>nul`) do set NODEVER=%%v
for /f "usebackq tokens=*" %%v in (`npm --version 2^>nul`) do set NPMVER=%%v
echo Node: %NODEVER%  npm: %NPMVER%

rem Check cargo/rust
where cargo >nul 2>&1
if %errorlevel%==0 goto :cargo_ok

if exist "%USERPROFILE%\.cargo\bin\cargo.exe" set "PATH=%PATH%;%USERPROFILE%\.cargo\bin"
if exist "%USERPROFILE%\.cargo\bin\cargo.exe" goto :cargo_ok

if %HAVE_WINGET%==1 (
  echo Rust/Cargo nao encontrado. Instalando rustup via winget...
  winget install --silent --accept-package-agreements --accept-source-agreements Rustlang.Rustup -e || echo "winget rustup falhou"
) else (
  echo Aviso: Cargo/Rust nao encontrado. Instale manualmente: https://rustup.rs
)

:cargo_ok
where cargo >nul 2>&1 && for /f "usebackq tokens=*" %%v in (`cargo --version 2^>nul`) do set CARGOVER=%%v
echo Cargo: %CARGOVER%

rem Check Git
where git >nul 2>&1 || (if %HAVE_WINGET%==1 (winget install --silent --accept-package-agreements --accept-source-agreements Git.Git -e) else echo Aviso: Git nao encontrado)
where git >nul 2>&1 && for /f "usebackq tokens=*" %%v in (`git --version 2^>nul`) do set GITVER=%%v
echo Git: %GITVER%

rem WebView2 check (edge webview runtime)
powershell -NoProfile -Command "(Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\EdgeUpdate\Clients' -ErrorAction SilentlyContinue) | Out-Null" >nul 2>&1
if %errorlevel% neq 0 (
  if %HAVE_WINGET%==1 (
    echo WebView2 nao encontrado. Instalando via winget...
    winget install --silent --accept-package-agreements --accept-source-agreements Microsoft.WebView2 -e || echo "winget webview2 falhou"
  ) else (
    echo Aviso: WebView2 nao encontrado. Instale manualmente.
  )
)

echo [2/9] Preparando backend: criando/ativando venv e instalando dependencias Python...
cd /d "%BACKEND%"
if not exist ".venv\Scripts\activate.bat" (
  echo Criando venv em backend\.venv ...
  %PY_CMD% -m venv .venv || call :on_error "Falha a criar venv" "%PY_CMD% -m venv .venv" "backend"
)
call .venv\Scripts\activate.bat || call :on_error "Falha a ativar venv" ".venv\Scripts\activate.bat" "backend"
echo Atualizando pip...
python -m pip install --upgrade pip setuptools wheel >nul 2>&1 || echo Aviso: falha a atualizar pip
if exist requirements.txt (
  echo Instalando requirements...
  pip install -r requirements.txt || call :on_error "pip install -r requirements.txt falhou" "pip install -r requirements.txt" "backend/requirements.txt"
) else (
  echo Aviso: requirements.txt nao encontrado em backend
)

echo [3/9] Preparando frontend: npm install
cd /d "%FRONTEND%"
if exist package.json (
  echo Instalando dependencias npm [pode demorar]...
  call npm install || call :on_error "npm install falhou" "npm install" "frontend/package.json"
) else (
  call :on_error "package.json nao encontrado" "dir frontend" "frontend"
)

echo [4/9] Criando ficheiros .env se inexistentes
cd /d "%ROOT%"
if not exist "%ROOT%.env" (
  echo VITE_API_URL=http://localhost:8000> "%ROOT%.env"
  echo .env criado na raiz
)
if not exist "%BACKEND%\.env" (
  if exist "%BACKEND%\.env.example" (copy "%BACKEND%\.env.example" "%BACKEND%\.env" >nul) else (echo SECRET_KEY=dev-secret-key > "%BACKEND%\.env" & echo DATABASE_URL=sqlite:///./app.db>> "%BACKEND%\.env")
  echo backend\.env criado
) else (
  echo backend\.env ja existe
)
if not exist "%FRONTEND%\.env" (
  if exist "%FRONTEND%\.env.example" (copy "%FRONTEND%\.env.example" "%FRONTEND%\.env" >nul) else (echo VITE_API_URL=http://localhost:8000> "%FRONTEND%\.env")
  echo frontend\.env criado
) else (
  echo frontend\.env ja existe
)

echo [5/9] Criando base de dados e executando seed se necessario
cd /d "%BACKEND%"
if not exist "app.db" (
  echo BD nao encontrada. A criar tabelas e executar seed...
  call .venv\Scripts\activate.bat
  rem Create tables via models
  %PY_CMD% -c "import sys; sys.path.insert(0, r'%BACKEND%'); from models import Base; from database import engine; Base.metadata.create_all(bind=engine); print('Tabelas criadas')" || call :on_error "Falha a criar tabelas" "python -c Base.metadata.create_all" "backend"
  rem Run seed
  %PY_CMD% -m backend.seed || (%PY_CMD% seed.py || echo Aviso: Seed falhou)
) else (
  echo Base de dados ja existe: backend\app.db
)

echo [6/9] Iniciando backend (uvicorn)...
cd /d "%ROOT%"
rem Start backend in a new window; use package import backend.main:app so routers' relative imports work
start "Backend" cmd /k call "%BACKEND%\.venv\Scripts\activate.bat" ^&^& uvicorn backend.main:app --host 127.0.0.1 --port 8000

echo Aguardando API ficar disponivel (ate 30s)...
powershell -NoProfile -Command "for ($i=0;$i -lt 30;$i++){ try{ $r=Invoke-WebRequest -UseBasicParsing -Uri http://127.0.0.1:8000/ -TimeoutSec 2; if ($r.StatusCode -eq 200) { Write-Host 'API disponivel'; exit 0 } } catch {}; Start-Sleep -Seconds 1 }; exit 2" >nul 2>&1
if %errorlevel%==2 (
  echo Aviso: API nao respondeu dentro do tempo previsto. Verifique a janela 'Backend' para erros.
) else (
  echo API respondendo em http://127.0.0.1:8000
)

echo [7/9] Iniciando o servidor web do Frontend (React/Vite)...
cd /d "%FRONTEND%"

rem Iniciar o Vite Frontend numa janela separada e abrir o navegador
start "Frontend Web" cmd /k cd /d "%FRONTEND%" ^&^& call npm run dev -- --open

echo [8/9] Inicializacao solicitada. Janelas separadas foram abertas para Backend e Frontend.
echo [9/9] Concluido. A aplicacao web ira abrir no seu navegador (http://localhost:5173).

echo ==================================================
echo Script terminado (as janelas permanecem abertas para debugging).
pause
:DIAGNOSTICO
echo Gerando diagnostico em %DIAGFILE% ...
del "%DIAGFILE%" >nul 2>&1
echo Diagnostico gerado em %DATE% %TIME% > "%DIAGFILE%"
echo. >> "%DIAGFILE%"
echo ===== Versoes ===== >> "%DIAGFILE%"
echo [Python] >> "%DIAGFILE%"
%PY_CMD% --version 2>&1 >> "%DIAGFILE%" || echo Python nao encontrado >> "%DIAGFILE%"
%PY_CMD% -m pip --version 2>&1 >> "%DIAGFILE%" || echo pip nao encontrado >> "%DIAGFILE%"
echo. >> "%DIAGFILE%"
echo [Node / npm] >> "%DIAGFILE%"
node --version 2>&1 >> "%DIAGFILE%" || echo Node nao encontrado >> "%DIAGFILE%"
call npm --version 2>&1 >> "%DIAGFILE%" || echo npm nao encontrado >> "%DIAGFILE%"
echo. >> "%DIAGFILE%"
echo [Rust / Cargo] >> "%DIAGFILE%"
cargo --version 2>&1 >> "%DIAGFILE%" || echo Cargo/Rust nao encontrado >> "%DIAGFILE%"
rustc --version 2>&1 >> "%DIAGFILE%" || echo rustc nao encontrado >> "%DIAGFILE%"
echo. >> "%DIAGFILE%"
echo [Git / Winget / Tauri] >> "%DIAGFILE%"
git --version 2>&1 >> "%DIAGFILE%" || echo Git nao encontrado >> "%DIAGFILE%"
where winget >nul 2>&1 && winget --version 2>&1 >> "%DIAGFILE%" || echo winget nao encontrado >> "%DIAGFILE%"
call npx -y @tauri-apps/cli --version 2>&1 >> "%DIAGFILE%" || echo Tauri CLI (npx) nao encontrado >> "%DIAGFILE%"
echo. >> "%DIAGFILE%"
echo ===== Environment Variables ===== >> "%DIAGFILE%"
echo VITE_API_URL=%VITE_API_URL% >> "%DIAGFILE%"
echo DATABASE_URL=%DATABASE_URL% >> "%DIAGFILE%"
echo SECRET_KEY=%SECRET_KEY% >> "%DIAGFILE%"
echo PATH=%PATH% >> "%DIAGFILE%"
echo. >> "%DIAGFILE%"
echo ===== Python dependencies (pip freeze) ===== >> "%DIAGFILE%"
%PY_CMD% -m pip freeze 2>&1 >> "%DIAGFILE%" || echo pip freeze falhou >> "%DIAGFILE%"
echo. >> "%DIAGFILE%"
echo ===== Node dependencies [package.json e npm ls] ===== >> "%DIAGFILE%"
if exist "%FRONTEND%\package.json" (type "%FRONTEND%\package.json" >> "%DIAGFILE%") else echo package.json frontend nao encontrado >> "%DIAGFILE%"
cd /d "%FRONTEND%"
call npm ls --depth=0 2>&1 >> "%DIAGFILE%" || echo npm ls falhou >> "%DIAGFILE%"
echo. >> "%DIAGFILE%"
echo ===== Comandos executados (ultimo arranque) ===== >> "%DIAGFILE%"
echo Script: %0 %* >> "%DIAGFILE%"
echo. >> "%DIAGFILE%"
echo ===== Logs backend/frontend (se existirem) ===== >> "%DIAGFILE%"
if exist "%BACKEND%\app.db" (echo DB backend presente: %BACKEND%\app.db >> "%DIAGFILE%") else echo DB backend ausente >> "%DIAGFILE%"
if exist "%BACKEND%\logs\backend.log" (type "%BACKEND%\logs\backend.log" >> "%DIAGFILE%") else echo Sem logs backend >> "%DIAGFILE%"
if exist "%FRONTEND%\dist" (echo Frontend dist existe >> "%DIAGFILE%") else echo Frontend dist inexistente >> "%DIAGFILE%"
echo. >> "%DIAGFILE%"
echo Diagnostico gravado em %DIAGFILE%
echo Abrir %DIAGFILE% para mais informacao.
pause
exit /b 0
:: Moved error handler to file end to avoid accidental early execution
:on_error
echo.
echo ERRO: %~1
echo Comando: %~2
echo Contexto: %~3
echo Verifique a janela de logs (se aberta) e corrija o problema.
pause
exit /b 1
