use serde::{Deserialize, Serialize};
use std::{collections::HashMap, fs, path::PathBuf};
use tauri::Manager;

#[derive(Clone, Serialize, Deserialize)]
pub struct UiConfig {
    #[serde(default = "default_sidebar_config")]
    pub sidebar: SidebarConfig,
    #[serde(default = "default_sort_config")]
    pub sort_config: Vec<SortConfig>,
    #[serde(default)]
    pub appearance: AppearanceConfig,
    #[serde(default, rename = "taskDefaults", alias = "task_defaults")]
    pub task_defaults: TaskDefaults,
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SidebarConfig {
    pub open: bool,
    pub open_and_float: bool,
    pub nav_open_items: HashMap<String, bool>,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct AppearanceConfig {
    pub theme: String,
}

impl Default for AppearanceConfig {
    fn default() -> Self {
        Self {
            theme: "system".to_string(),
        }
    }
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TaskDefaults {
    pub priority: i32,
}

impl Default for TaskDefaults {
    fn default() -> Self {
        Self { priority: 4 }
    }
}

#[derive(Clone, Serialize, Deserialize)]
pub struct SortConfig{
    pub sort_by: String,
    pub column_name: String,
}

fn default_sidebar_config() -> SidebarConfig {
    SidebarConfig {
        open: true,
        open_and_float: false,
        nav_open_items: HashMap::new(),
    }
}

fn default_sort_config() -> Vec<SortConfig> {
    vec![
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
    ]
}

fn default_ui_config() -> UiConfig {
    UiConfig {
        sidebar: default_sidebar_config(),
        sort_config: default_sort_config(),
        appearance: AppearanceConfig::default(),
        task_defaults: TaskDefaults::default(),
    }
}

fn normalize_ui_config(mut config: UiConfig) -> UiConfig {
    if !matches!(config.appearance.theme.as_str(), "system" | "light" | "dark") {
        config.appearance.theme = "system".to_string();
    }

    if !(1..=4).contains(&config.task_defaults.priority) {
        config.task_defaults.priority = 4;
    }

    config
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
        let config = normalize_ui_config(config);
        // Rewrite old configs so newly added defaulted fields become durable.
        save_ui_config(app, config.clone())?;
        return Ok(config);
    }

    let config = default_ui_config();
    save_ui_config(app, config.clone())?;
    Ok(config)
}

#[tauri::command]
pub fn save_ui_config(app: tauri::AppHandle, config: UiConfig) -> Result<(), String> {
    let path = config_path(&app)?;
    let config = normalize_ui_config(config);
    let yaml = serde_yaml::to_string(&config).map_err(|err| err.to_string())?;
    fs::write(path, yaml).map_err(|err| err.to_string())?;
    Ok(())
}
