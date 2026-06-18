#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]

use tauri_plugin_shell::ShellExt;

fn main() {
  tauri::Builder::default()
    .plugin(tauri_plugin_shell::init())
    .setup(|app| {
      #[cfg(not(debug_assertions))]
      {
          let sidecar_command = app.shell().sidecar("backend-api")
              .expect("Falha ao inicializar o comando do sidecar");
          
          let (_receiver, _child) = sidecar_command.spawn()
              .expect("Falha ao executar o sidecar");
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
