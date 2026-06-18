# AgendaApp Desktop

Uma aplicação Desktop profissional desenvolvida com **React**, **FastAPI**, e empacotada com **Tauri** e **PyInstaller**.

## Características Principais
* **Desktop Nativo**: Usa o WebView2 via Tauri, garantindo que corre sem necessidade de abrir o navegador.
* **Autossuficiente**: O backend FastAPI é compilado e executado automaticamente como um processo filho (sidecar) pelo Tauri. O utilizador final não necessita de instalar Python, Node ou Rust.
* **Segurança**: As chaves API não estão expostas no código, sendo carregadas via variáveis de ambiente seguras.

---

## 💻 Desenvolvimento

Para programar e contribuir para o projeto, siga estes passos:

### 1. Pré-requisitos
* Node.js (v18+)
* Python (3.10+)
* Rust e Cargo
* Tauri CLI

### 2. Configuração Inicial
Copie os ficheiros `.env.example` para as suas pastas correspondentes:
- `backend/.env`
- `frontend/.env`

*(Assegure-se de que nunca comita os ficheiros `.env` para o Git, eles já estão ignorados no `.gitignore`)*

### 3. Iniciar Ambiente de Desenvolvimento
Basta executar o script de dev na raiz do projeto:
```bat
dev.bat
```
Este script irá instalar as dependências necessárias, ativar o ambiente virtual (venv), rodar o servidor FastAPI, e iniciar o Tauri Dev, abrindo a janela da aplicação.

---

## 📦 Compilação (Build Final)

Quando o projeto estiver pronto para ser distribuído aos utilizadores, basta executar o comando de build automático:

```bat
build.bat
```

**O que o build.bat faz:**
1. Instala o PyInstaller.
2. Compila todo o código Python (FastAPI) num único executável (`backend-api.exe`).
3. Copia o executável compilado para a pasta `src-tauri/bin/` como um sidecar.
4. Usa o `tauri build` para compilar o Frontend (React/Vite) e criar os instaladores finais da aplicação.

---

## 🚀 Distribuição

Após correr o `build.bat`, os ficheiros gerados estarão na pasta:
`frontend\src-tauri\target\release\bundle`

Pode distribuir:
* O instalador **.msi** ou **.exe** para instalação fácil (recomendado para Windows 10/11).
* Os ficheiros avulsos na pasta `Release` se preferir criar um formato `.zip` portátil.

O utilizador final **não necessitará de instalar nada** para a aplicação funcionar perfeitamente!
