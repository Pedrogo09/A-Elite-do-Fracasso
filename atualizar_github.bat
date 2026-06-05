@echo off
setlocal enabledelayedexpansion

cls
echo ==========================================
echo   E-MATERIA HUB - GITHUB ASSISTANT
echo ==========================================
echo.

:: 1. Verificar GIT
where git >nul 2>nul
if !errorlevel! neq 0 (
  echo [ERRO] Git nao esta instalado!
  echo Solucao: Instala em https://git-scm.com
  pause
  exit /b 1
)

:: 2. Verificar Identidade
for /f "tokens=*" %%i in ('git config user.name 2^>nul') do set "GIT_USER=%%i"

if "!GIT_USER!"=="" (
  cls
  echo ==========================================
  echo   CONFIGURAR IDENTIDADE GIT
  echo ==========================================
  echo.
  set /p GIT_NAME="Introduz o teu nome (ex: Master): "
  set /p GIT_EMAIL="Introduz o teu email do GitHub: "
  
  git config --global user.name "!GIT_NAME!"
  git config --global user.email "!GIT_EMAIL!"
  
  echo [OK] Identidade configurada!
  echo.
)

:: 3. Verificar Repositorio
if not exist ".git" (
  echo [AVISO] Repositorio local nao inicializado. A configurar...
  git init
  git remote add origin https://github.com/Pedrogo09/A-Elite-do-Fracasso.git
  git branch -M main
  echo [OK] Repositorio configurado!
  echo.
)

:: 4. Guardar alteracoes locais
echo [*] A preparar e registar alteracoes locais...
git add .

for /f "tokens=*" %%i in ('wmic os get localdatetime ^| findstr \.') do set "TIMESTAMP=%%i"
set "TIMESTAMP=%TIMESTAMP:~0,4%-%TIMESTAMP:~4,2%-%TIMESTAMP:~6,2% %TIMESTAMP:~8,2%:%TIMESTAMP:~10,2%:%TIMESTAMP:~12,2%"

git commit -m "Update automatico: !TIMESTAMP!" 2>nul
if !errorlevel! equ 1 (
  echo [INFO] Nenhuma alteracao para guardar.
)

echo.

:: 5. Sincronizar com o servidor
echo [*] A sincronizar com o servidor (pull)...
git pull origin main --no-edit --allow-unrelated-histories 2>nul

echo.

:: 6. Enviar
echo [*] A enviar para o GitHub...
echo [!] Se abrir uma janela, faz login no teu browser.
echo.

git push origin main --force

if !errorlevel! neq 0 (
  echo.
  echo ------------------------------------------
  echo [ERRO CRITICO] Falha ao enviar para o GitHub.
  echo Possiveis causas:
  echo 1. LOGIN: Nao estas logado ou o token expirou.
  echo 2. PERMISSAO: Nao tens acesso a Pedrogo09/A-Elite-do-Fracasso.
  echo 3. REDE: Verifica a tua ligacao a internet.
  echo ------------------------------------------
  pause
  exit /b 1
) else (
  echo.
  echo ==========================================
  echo    TUDO ATUALIZADO COM SUCESSO!
  echo ==========================================
  echo.
  pause
)
