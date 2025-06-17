#![allow(unused_imports)]
use tauri::Manager;
use utils::hashmap::{get_data, set_data};
use utils::request::{get_aniplay_chapters, get_aniplay_episode, get_base64_image};
use webview2_com::{
    Microsoft::Web::WebView2::Win32::{
        ICoreWebView2WebResourceRequest, COREWEBVIEW2_WEB_RESOURCE_CONTEXT_ALL,
    },
    WebResourceRequestedEventHandler,
};
use windows::core::HSTRING;
use windows::Win32::System::Com::MachineGlobalObjectTableRegistrationToken;

mod utils;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[allow(unused_mut)]
    let mut builder = tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            set_data,
            get_data,
            get_aniplay_chapters,
            get_aniplay_episode,
            get_base64_image
        ])
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_cache::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::new().build());
    #[cfg(mobile)]
    {
        builder = builder.setup(|app| {
            app.handle().plugin(tauri_plugin_app_events::init())?;
            Ok(())
        });
    }
    #[cfg(desktop)]
    {
        builder = builder
            .setup(|app| {
                let window = app.get_webview_window("main").unwrap();
                let args: Vec<String> = std::env::args().collect();
                if args.contains(&"--flag1".to_string()) {
                    window.hide().unwrap();
                }
                #[cfg(target_os = "windows")]
                {
                    window
                        .with_webview(|webview| unsafe {
                            let core = webview.controller().CoreWebView2().unwrap();
                            core.AddWebResourceRequestedFilter(
                                &HSTRING::from("*"),
                                COREWEBVIEW2_WEB_RESOURCE_CONTEXT_ALL,
                            )
                            .unwrap();
                            let mut _token: MachineGlobalObjectTableRegistrationToken =
                                MachineGlobalObjectTableRegistrationToken::default();
                            core.add_WebResourceRequested(
                                &WebResourceRequestedEventHandler::create(Box::new(
                                    move |_webview, args| {
                                        if let Some(args) = args {
                                            let request: ICoreWebView2WebResourceRequest =
                                                args.Request().unwrap();
                                            request
                                                .Headers()
                                                .unwrap()
                                                .SetHeader(
                                                    &HSTRING::from("Origin"),
                                                    &HSTRING::from("https://github.com/"),
                                                )
                                                .unwrap();
                                        }
                                        Ok(())
                                    },
                                )),
                                &mut _token as *mut _ as *mut i64,
                            )
                            .unwrap();
                        })
                        .unwrap();
                }
                Ok(())
            })
            .plugin(tauri_plugin_clipboard::init())
            // .plugin(tauri_plugin_drpc::init())
            .plugin(tauri_plugin_cli::init())
            .plugin(tauri_plugin_window_state::Builder::default().build())
            .plugin(tauri_plugin_updater::Builder::new().build())
            .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
                let win = app.get_webview_window("main").unwrap();
                win.show().unwrap();
                win.set_focus().unwrap();
            }))
            .plugin(tauri_plugin_autostart::init(
                tauri_plugin_autostart::MacosLauncher::LaunchAgent,
                Some(vec!["--flag1", "--flag2"]),
            ))
            .plugin(tauri_plugin_global_shortcut::Builder::new().build());
    }
    builder.run(tauri::generate_context!()).unwrap()
}
