@echo off
setlocal enabledelayedexpansion

set "ROOT=%~dp0"
set "BACKEND=%ROOT%backend"
set "FRONTEND=%ROOT%frontend"

echo =================================================================
echo AgendaApp - Instalador (Corre apenas uma vez no computador novo)
echo =================================================================

:: Tenta usar o Node Portatil se existir (senao usa o global)
set "PATH=C:\Users\11PI12\Documents\node-v24.17.0-win-x64\node-v24.17.0-win-x64;%PATH%"

echo.
echo [1/2] A instalar as dependencias do Backend (Python)...
cd /d "%BACKEND%"
if not exist ".venv\Scripts\activate.bat" (
  python -m venv .venv
  call .venv\Scripts\activate.bat
  pip install -r requirements.txt
  :: Instalar pywebview para a janela desktop
  pip install pywebview
) else (
  echo Backend ja esta instalado. A atualizar...
  call .venv\Scripts\activate.bat
  pip install -r requirements.txt
  pip install pywebview
)

echo.
echo [2/2] A instalar as dependencias do Frontend (NodeJS)...
cd /d "%FRONTEND%"
if not exist "node_modules" (
  call npm install
) else (
  echo Frontend ja esta instalado.
)

echo.
echo =================================================================
echo INSTALACAO CONCLUIDA! 
echo =================================================================
echo Agora ja podes fechar esta janela e clicar duas vezes no
echo ficheiro "Abrir_Agenda.vbs" para usar a aplicacao!
echo.
pause
