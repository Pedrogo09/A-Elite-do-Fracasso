@echo off
cd /d "%~dp0backend"
call .venv\Scripts\activate.bat
pip install pywebview
echo DONE
