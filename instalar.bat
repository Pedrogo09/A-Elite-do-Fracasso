@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

for /f %%A in ('"prompt $E & for %%B in (1) do rem"') do set "ESC=%%A"
set "G=!ESC![32m"
set "Y=!ESC![33m"
set "R=!ESC![31m"
set "C=!ESC![36m"
set "Z=!ESC![0m"

echo !C!========================================!Z!
echo !C!   A-Elite-do-Fracasso - Instalador!Z!
echo !C!========================================!Z!
echo.

rem -----------------------------------------------
rem 1) Admin check
rem -----------------------------------------------
net session >nul 2>&1
if !errorlevel!==0 (
    echo !G![OK]!Z! Permissoes de Administrador detectadas.
) else (
    echo !Y![AVISO]!Z! Sem permissoes de Administrador.
)
timeout /t 1 /nobreak >nul

rem -----------------------------------------------
rem 2) Python
rem -----------------------------------------------
echo.
echo !C!=== VERIFICAR PYTHON ===!Z!
python --version >nul 2>&1
if !errorlevel!==0 goto python_ok

echo !Y![AVISO]!Z! Python nao encontrado.
echo !C![...]!Z! A transferir Python 3.11.9...
powershell -NoProfile -Command "Invoke-WebRequest -Uri 'https://www.python.org/ftp/python/3.11.9/python-3.11.9-amd64.exe' -OutFile (Join-Path $env:TEMP 'python-3.11.9-amd64.exe') -UseBasicParsing"
if not exist "%TEMP%\python-3.11.9-amd64.exe" goto erro_python_dl
powershell -NoProfile -Command "Add-Type -AssemblyName PresentationFramework; [System.Windows.MessageBox]::Show('O instalador do Python vai abrir agora.`n`nOBRIGATORIO:`nMarca a caixa: Add Python to PATH`n(esta na parte de baixo da primeira janela)`n`nSe nao marcares o projecto NAO funciona!','Instrucao importante','OK','Warning')"
echo !C![...]!Z! A abrir instalador Python...
start /wait "" "%TEMP%\python-3.11.9-amd64.exe"
timeout /t 3 /nobreak >nul
for /f "tokens=2*" %%A in ('reg query "HKCU\Environment" /v PATH 2^>nul') do set "UPATH=%%B"
for /f "tokens=2*" %%A in ('reg query "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v PATH 2^>nul') do set "SPATH=%%B"
set "PATH=!SPATH!;!UPATH!"
python --version >nul 2>&1
if !errorlevel! neq 0 goto erro_python_path
goto python_ok

:erro_python_dl
echo !R![ERRO]!Z! Falha ao transferir Python.
pause & exit /b 1

:erro_python_path
echo !R![ERRO]!Z! Python nao encontrado apos instalacao. Certifica-te que marcaste "Add Python to PATH".
echo !Y![AVISO]!Z! Fecha esta janela, abre um novo terminal e volta a correr instalar.bat
pause & exit /b 1

:python_ok
for /f "tokens=*" %%V in ('python --version 2^>^&1') do set "PYVER=%%V"
echo !G![OK]!Z! Python: !PYVER!
timeout /t 1 /nobreak >nul

rem -----------------------------------------------
rem 3) Node.js (zip -> AppData\Local\nodejs)
rem -----------------------------------------------
echo.
echo !C!=== VERIFICAR NODE.JS ===!Z!

set "NODE_DIR=%USERPROFILE%\AppData\Local\nodejs"

if exist "!NODE_DIR!\node.exe" goto node_ok
node --version >nul 2>&1
if !errorlevel!==0 goto node_ok

echo !Y![AVISO]!Z! Node.js nao encontrado.
echo !C![...]!Z! A transferir e extrair Node.js v20.19.0 (zip)...
set "NODE_POWERSHELL=%TEMP%\install_node.ps1"
(
    echo Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.19.0/node-v20.19.0-win-x64.zip' -OutFile "$env:TEMP\node_win.zip" -UseBasicParsing
    echo if (Test-Path "$env:USERPROFILE\AppData\Local\nodejs_tmp") { Remove-Item -Recurse -Force "$env:USERPROFILE\AppData\Local\nodejs_tmp" }
    echo Expand-Archive -Path "$env:TEMP\node_win.zip" -DestinationPath "$env:USERPROFILE\AppData\Local\nodejs_tmp" -Force
) > "%NODE_POWERSHELL%"
powershell -NoProfile -ExecutionPolicy Bypass -File "%NODE_POWERSHELL%"
if not exist "%TEMP%\node_win.zip" goto erro_node_dl
echo !C![...]!Z! A extrair Node.js...
if exist "%USERPROFILE%\AppData\Local\nodejs_tmp" rmdir /s /q "%USERPROFILE%\AppData\Local\nodejs_tmp"
powershell -NoProfile -Command "Expand-Archive -Path (Join-Path $env:TEMP 'node_win.zip') -DestinationPath (Join-Path $env:USERPROFILE 'AppData\Local\nodejs_tmp') -Force" 2>nul || rem fallback to PS script
if exist "%NODE_POWERSHELL%" del "%NODE_POWERSHELL%" >nul 2>&1

for /f "delims=" %%D in ('dir /b "%USERPROFILE%\AppData\Local\nodejs_tmp" 2^>nul') do (
    if exist "!NODE_DIR!" rmdir /s /q "!NODE_DIR!"
    move "%USERPROFILE%\AppData\Local\nodejs_tmp\%%D" "!NODE_DIR!" >nul
    goto node_moved
)
:node_moved
if exist "%USERPROFILE%\AppData\Local\nodejs_tmp" rmdir /s /q "%USERPROFILE%\AppData\Local\nodejs_tmp"
del "%TEMP%\node_win.zip" >nul 2>&1

if not exist "!NODE_DIR!\node.exe" goto erro_node_extract

set "PATH=!NODE_DIR!;!PATH!"
powershell -NoProfile -ExecutionPolicy Bypass -Command "& { $old=[Environment]::GetEnvironmentVariable('PATH','User'); if ($old -notlike '*nodejs*') { [Environment]::SetEnvironmentVariable('PATH','%NODE_DIR%;'+$old,'User') } }"
goto node_ok

:erro_node_dl
echo !R![ERRO]!Z! Falha ao transferir Node.js.
pause & exit /b 1

:erro_node_extract
echo !R![ERRO]!Z! Falha ao extrair Node.js.
pause & exit /b 1

:node_ok
set "NODE_EXE=node"
if exist "!NODE_DIR!\node.exe" set "NODE_EXE=!NODE_DIR!\node.exe"
for /f "tokens=*" %%v in ('"!NODE_EXE!" --version 2^>^&1') do set "NODEVER=%%v"
set "PATH=!NODE_DIR!;!PATH!"
echo !G![OK]!Z! Node.js: !NODEVER!
timeout /t 1 /nobreak >nul

rem -----------------------------------------------
rem 4) Rust
rem -----------------------------------------------
echo.
echo !C!=== VERIFICAR RUST ===!Z!
rustc --version >nul 2>&1
if !errorlevel!==0 goto rust_ok
if exist "%USERPROFILE%\.cargo\bin\rustc.exe" goto rust_ok

echo !Y![AVISO]!Z! Rust nao encontrado. A transferir rustup-init...
powershell -NoProfile -Command "Invoke-WebRequest -Uri 'https://win.rustup.rs/x86_64' -OutFile (Join-Path $env:TEMP 'rustup-init.exe') -UseBasicParsing"
if not exist "%TEMP%\rustup-init.exe" goto erro_rust_dl
echo !C![...]!Z! A instalar Rust (pode demorar varios minutos)...
start /wait "" "%TEMP%\rustup-init.exe" -y --default-toolchain stable
set "PATH=%USERPROFILE%\.cargo\bin;!PATH!"
rustc --version >nul 2>&1
if !errorlevel! neq 0 goto erro_rust_path
goto rust_ok

:erro_rust_dl
echo !R![ERRO]!Z! Falha ao transferir rustup-init.
pause & exit /b 1

:erro_rust_path
echo !R![ERRO]!Z! Rust nao encontrado apos instalacao. Fecha e reabre o terminal.
pause & exit /b 1

:rust_ok
set "PATH=%USERPROFILE%\.cargo\bin;!PATH!"
for /f "tokens=*" %%v in ('rustc --version 2^>^&1') do set "RUSTVER=%%v"
echo !G![OK]!Z! Rust: !RUSTVER!
timeout /t 1 /nobreak >nul

rem -----------------------------------------------
rem 5) Ficheiros .env
rem -----------------------------------------------
echo.
echo !C!=== CRIAR .env ===!Z!
if not exist ".env" (
    if exist ".env.example" (
        copy /Y ".env.example" ".env" >nul
        echo !Y![AVISO]!Z! .env criado a partir do .env.example.
    ) else (
        echo !Y![AVISO]!Z! .env.example nao encontrado na raiz.
    )
) else (
    echo !G![OK]!Z! .env ja existe. Nao foi sobrescrito.
)
if not exist "backend\.env" (
    if exist "backend\.env.example" (
        copy /Y "backend\.env.example" "backend\.env" >nul
        echo !Y![AVISO]!Z! backend\.env criado a partir do exemplo.
    ) else (
        echo !Y![AVISO]!Z! backend\.env.example nao encontrado.
    )
) else (
    echo !G![OK]!Z! backend\.env ja existe. Nao foi sobrescrito.
)
timeout /t 1 /nobreak >nul

rem -----------------------------------------------
rem 6) Backend Python
rem -----------------------------------------------
echo.
echo !C!=== BACKEND (Python / FastAPI) ===!Z!

if exist "backend\.venv" (
    if not exist "backend\.venv\Scripts\python.exe" (
        echo !Y![AVISO]!Z! .venv incompleto. A remover...
        rmdir /s /q "backend\.venv"
    ) else (
        echo !G![OK]!Z! Virtualenv existente e valido.
    )
)

if not exist "backend\.venv\Scripts\python.exe" (
    echo !C![...]!Z! A criar virtualenv...
    python -m venv "backend\.venv"
    if !errorlevel! neq 0 (
        echo !R![ERRO]!Z! Falha ao criar virtualenv.
        pause & exit /b 1
    )
    echo !G![OK]!Z! Virtualenv criado.
) else (
    echo !G![OK]!Z! Virtualenv ja existe.
)

echo !C![...]!Z! A activar virtualenv...
call "backend\.venv\Scripts\activate.bat"

echo !C![...]!Z! A actualizar pip...
python -m pip install --upgrade pip >nul 2>&1
echo !G![OK]!Z! pip actualizado.

echo !C![...]!Z! A instalar requirements.txt...
pip install -r "backend\requirements.txt"
if !errorlevel! neq 0 (
    echo !R![ERRO]!Z! Falha ao instalar dependencias Python.
    pause & exit /b 1
)
echo !C![...]!Z! A corrigir bcrypt (compatibilidade com passlib 1.7.x)...
pip install "bcrypt==4.0.1" >nul 2>&1
echo !G![OK]!Z! bcrypt==4.0.1 instalado.
echo !G![OK]!Z! Dependencias Python instaladas.
timeout /t 1 /nobreak >nul

rem Base de dados
if exist "backend\alembic.ini" (
    echo !C![...]!Z! A correr alembic upgrade head...
    pushd backend
    alembic upgrade head
    set ALEM_ERR=!errorlevel!
    popd
    if !ALEM_ERR! neq 0 (
        echo !R![ERRO]!Z! Falha nas migrations Alembic.
        pause
    ) else (
        echo !G![OK]!Z! Migrations aplicadas.
    )
) else (
    echo !C![...]!Z! A criar tabelas via SQLAlchemy...
    (
        echo import sys
        echo sys.path.insert(0, 'backend'^)
        echo try:
        echo     from database import Base, engine
        echo     Base.metadata.create_all(engine^)
        echo     print('Tabelas criadas.'^)
        echo except Exception as e:
        echo     print('ERRO:', e^)
        echo     sys.exit(1^)
    ) > "%TEMP%\ct.py"
    python "%TEMP%\ct.py"
    if !errorlevel! neq 0 (
        echo !R![ERRO]!Z! Falha ao criar tabelas.
        pause
    ) else (
        echo !G![OK]!Z! Tabelas criadas.
    )
    del "%TEMP%\ct.py" >nul 2>&1
)

rem Seed opcional
if exist "backend\seed.py" (
    echo.
    choice /c SN /m "Queres popular a BD com dados de exemplo (seed)?"
    if !errorlevel!==1 (
        python -m backend.seed
        if !errorlevel!==0 (
            echo !G![OK]!Z! Seed executado com sucesso.
        ) else (
            echo !R![ERRO]!Z! Falha ao executar seed.py
            pause
        )
    ) else (
        echo !Y![AVISO]!Z! Seed ignorado.
    )
)

deactivate >nul 2>&1
echo !G![OK]!Z! Setup backend concluido.
timeout /t 1 /nobreak >nul

rem -----------------------------------------------
rem 7) Frontend
rem -----------------------------------------------
echo.
echo !C!=== FRONTEND (Node.js / Tauri) ===!Z!
if not exist "frontend" (
    echo !R![ERRO]!Z! Pasta frontend nao encontrada.
    pause & exit /b 1
)
pushd frontend
echo !C![...]!Z! A corrigir versoes no package.json...
powershell -NoProfile -Command "$c = Get-Content package.json -Raw; $c = $c -replace '\"@types/react\":\s*\"[^\"]+\"', '\"@types/react\": \"^18.3.0\"'; $c = $c -replace '\"@types/react-dom\":\s*\"[^\"]+\"', '\"@types/react-dom\": \"^18.3.0\"'; $c = $c -replace '\"@types/react-router-dom\":\s*\"[^\"]+\"', '\"@types/react-router-dom\": \"^5.3.3\"'; Set-Content package.json $c -NoNewline"
echo !G![OK]!Z! package.json corrigido.
echo !C![...]!Z! A instalar dependencias npm...
npm install --legacy-peer-deps
if !errorlevel! neq 0 (
    echo !R![ERRO]!Z! Falha no npm install.
    popd
    pause & exit /b 1
)
echo !G![OK]!Z! Dependencias npm instaladas.
npx tauri --version >nul 2>&1
if !errorlevel! neq 0 (
    echo !Y![AVISO]!Z! Tauri CLI nao encontrada. A instalar...
    npm install --save-dev @tauri-apps/cli@^2.7.0 --legacy-peer-deps
    if !errorlevel! neq 0 (
        echo !R![ERRO]!Z! Falha ao instalar @tauri-apps/cli.
        popd
        pause & exit /b 1
    )
    echo !G![OK]!Z! @tauri-apps/cli instalado.
) else (
    echo !G![OK]!Z! Tauri CLI disponivel.
)
popd
timeout /t 1 /nobreak >nul

rem -----------------------------------------------
rem 8) Gerar iniciar.bat
rem -----------------------------------------------
echo.
echo !C!=== GERAR iniciar.bat ===!Z!
(
    echo @echo off
    echo chcp 65001 ^>nul
    echo title A-Elite-do-Fracasso
    echo echo.
    echo echo A iniciar Backend FastAPI...
    echo start "Backend FastAPI" cmd /k "cd /d "%%~dp0backend" ^&^& call .venv\Scripts\activate.bat ^&^& python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000"
    echo timeout /t 3 /nobreak ^>nul
    echo echo A iniciar Frontend Tauri...
    echo start "Frontend Tauri" cmd /k "cd /d "%%~dp0frontend" ^&^& npm run tauri"
    echo echo.
    echo echo Aguarda alguns segundos ate a aplicacao abrir.
    echo pause
) > "iniciar.bat"
if exist "iniciar.bat" (
    echo !G![OK]!Z! iniciar.bat criado na raiz.
) else (
    echo !Y![AVISO]!Z! Nao foi possivel criar iniciar.bat.
)

rem -----------------------------------------------
rem 9) Fim
rem -----------------------------------------------
echo.
echo !C!========================================!Z!
echo !G![SUCESSO]!Z! Instalacao concluida!
echo.
echo   Para iniciar o projecto corre: iniciar.bat
echo.
pause
endlocal