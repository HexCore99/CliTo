// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

mod db;
mod tasks;
mod ui_config;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            tasks::get_tasks,
            tasks::create_task,
            tasks::delete_task,
            tasks::update_position,
            tasks::update_task_status,
            tasks::set_due_date,
            tasks::set_priority,
            tasks::set_description,
            tasks::sort_tasks,
            ui_config::get_ui_config,
            ui_config::save_ui_config
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
