import subprocess
import os
import time
import sys
import webview

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
VENV_PYTHON = os.path.join(ROOT_DIR, "backend", ".venv", "Scripts", "python.exe")
NODE_PATH = r"C:\Users\11PI12\Documents\node-v24.17.0-win-x64\node-v24.17.0-win-x64"

def kill_proc(proc):
    try:
        subprocess.run(
            ["taskkill", "/F", "/T", "/PID", str(proc.pid)],
            creationflags=subprocess.CREATE_NO_WINDOW,
            capture_output=True
        )
    except Exception:
        pass


def main():
    # 1. Iniciar Backend com o Python do venv (tem FastAPI, SQLAlchemy, etc.)
    backend_proc = subprocess.Popen(
        [VENV_PYTHON, "-m", "uvicorn", "backend.main:app",
         "--host", "127.0.0.1", "--port", "8000"],
        cwd=ROOT_DIR,
        creationflags=subprocess.CREATE_NO_WINDOW
    )

    # 2. Iniciar Frontend (Vite/React)
    frontend_env = os.environ.copy()
    frontend_env["PATH"] = NODE_PATH + os.pathsep + frontend_env.get("PATH", "")

    frontend_proc = subprocess.Popen(
        "npm.cmd run dev",
        cwd=os.path.join(ROOT_DIR, "frontend"),
        env=frontend_env,
        shell=True,
        creationflags=subprocess.CREATE_NO_WINDOW
    )

    # 3. Aguardar os servidores arrancarem
    time.sleep(5)

    # 4. Abrir a janela Desktop nativa (sem barra de endereços, sem abas)
    window = webview.create_window(
        "AgendaApp",
        "http://localhost:5173",
        width=1200,
        height=800,
        resizable=True
    )

    # Bloqueia aqui até o utilizador fechar a janela
    webview.start()

    # 5. Limpar tudo quando a janela for fechada
    kill_proc(backend_proc)
    kill_proc(frontend_proc)


if __name__ == "__main__":
    main()
