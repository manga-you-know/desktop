#![allow(unused_imports)]
use tauri::Manager;
use tauri_plugin_sql::{Migration, MigrationKind};
use utils::{hashmap::*, request::*};

mod utils;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    /*   let migrations = vec![migration {
        version: 1,
        description: "add first migration",
        sql: include_str!("../migrations/0000_dazzling_nitro.sql"),
        kind: migrationkind::up,
    }];
        .plugin(
            tauri_plugin_sql::Builder::default()
                // .add_migrations("sqlite:database.db", migrations)
                .build(),
        ) */
    #[cfg(target_os = "linux")]
    let runtime = tauri_runtime_cef::Cef::default();

    #[cfg(not(target_os = "linux"))]
    let runtime = tauri_runtime_wry::Wry::default();

    #[allow(unused_mut)]
    let mut builder = tauri::Builder::default()
        .runtime(runtime)
        .invoke_handler(tauri::generate_handler![
            set_data,
            get_data,
            get_base64_image
        ])
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_store::Builder::new().build());

    #[cfg(desktop)]
    {
        builder = builder
            .plugin(tauri_plugin_cli::init())
            .plugin(tauri_plugin_positioner::init())
            // .plugin(tauri_plugin_prevent_default::debug())
            .plugin(tauri_plugin_window_state::Builder::default().build())
            .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
                let win = app.get_webview_window("main").unwrap();
                win.show().unwrap();
                win.set_focus().unwrap();
            }))
            .plugin(tauri_plugin_autostart::init(
                tauri_plugin_autostart::MacosLauncher::LaunchAgent,
                Some(vec!["--flag1", "--flag2"]),
            ))
            .plugin(tauri_plugin_global_shortcut::Builder::new().build())
            .plugin(tauri_plugin_updater::Builder::new().build());
    }

    builder
        .run(tauri::generate_context!())
        .expect("error while running MYK")
}
