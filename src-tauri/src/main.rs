#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod config;
mod shutdown;
mod timer;
mod tray;

use config::{load_config, save_config};
use shutdown::{cancel_system_shutdown, shutdown_now};
use std::sync::Arc;
use tauri::{AppHandle, Manager};
use timer::{
    cancel_timer, get_timer_status, pause_timer, resume_timer, start_countdown,
    start_scheduled, AppTimer,
};

#[tauri::command]
fn exit_app(app: AppHandle) {
    app.exit(0);
}

#[tauri::command]
fn hide_window(app: AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.hide();
    }
}

#[tauri::command]
fn show_window(app: AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.set_focus();
    }
}

fn main() {
    let app_timer = Arc::new(AppTimer::new());

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .manage(app_timer)
        .setup(|app| {
            tray::create_tray(&app.handle())?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            load_config,
            save_config,
            shutdown_now,
            cancel_system_shutdown,
            start_countdown,
            start_scheduled,
            cancel_timer,
            pause_timer,
            resume_timer,
            get_timer_status,
            exit_app,
            hide_window,
            show_window
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}