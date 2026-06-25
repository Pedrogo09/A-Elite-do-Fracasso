import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { Toaster } from "sonner";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster 
        position="top-right" 
        richColors 
        theme="dark"
        toastOptions={{
          className: 'max-w-sm w-full backdrop-blur-xl border border-indigo-500/20 shadow-[0_10px_40px_-10px_rgba(99,91,255,0.2)]',
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
