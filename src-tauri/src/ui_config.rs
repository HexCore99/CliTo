use serde::{Deserialize, Serialize};
use std::{collections::HashMap, fs, path::PathBuf};
use tauri::Manager;

#[derive(Clone, Serialize, Deserialize)]
pub struct UiConfig {
    pub sidebar: SidebarConfig,
    pub sort_config: Vec<SortConfig>,
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SidebarConfig {
    pub open: bool,
    pub open_and_float: bool,
    pub nav_open_items: HashMap<String, bool>,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct SortConfig{
    pub sort_by: String,
    pub column_name: String,
}

fn default_ui_config() -> UiConfig {
    let mut nav_open_items: HashMap<String, bool> = HashMap::new();

    nav_open_items.insert("Tasks".to_string(), true);
    nav_open_items.insert("Settings".to_string(), true);

    UiConfig {
        sidebar: SidebarConfig {
            open: true,
            open_and_float: false,
            nav_open_items,
        },
        sort_config: vec![
            SortConfig {
            sort_by: "default".to_string(),
            column_name: "todo".to_string(),
        },
            SortConfig {
            sort_by: "default".to_string(),
            column_name: "in-progress".to_string(),
        },
            SortConfig {
            sort_by: "default".to_string(),
            column_name: "completed".to_string(),
        },
        ],
    }
}


fn config_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let app_data_dir = app.path().app_data_dir().map_err(|err| err.to_string())?;

    fs::create_dir_all(&app_data_dir).map_err(|err| err.to_string())?;
    Ok(app_data_dir.join("ui_config.yaml"))
}

#[tauri::command]
pub fn get_ui_config(app: tauri::AppHandle) -> Result<UiConfig, String> {
    let path = config_path(&app)?;

    if path.exists() {
        let yaml = fs::read_to_string(&path).map_err(|err| err.to_string())?;
        let config: UiConfig = serde_yaml::from_str(&yaml).map_err(|err| err.to_string())?;
        return Ok(config);
    }

    let config = default_ui_config();
    save_ui_config(app, config.clone())?;
    Ok(config)
}

#[tauri::command]
pub fn save_ui_config(app: tauri::AppHandle, config: UiConfig) -> Result<(), String> {
    let path = config_path(&app)?;
    let yaml = serde_yaml::to_string(&config).map_err(|err| err.to_string())?;
    fs::write(path, yaml).map_err(|err| err.to_string())?;
    Ok(())
}
