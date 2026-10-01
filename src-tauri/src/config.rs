use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppConfig {
    pub background: BackgroundConfig,
    pub confirm_before_shutdown: bool,
    pub minimize_to_tray: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BackgroundConfig {
    pub bg_type: String,
    pub color: String,
    pub opacity: f32,
    pub image_path: Option<String>,
    pub fit_mode: String,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            background: BackgroundConfig {
                bg_type: "color".to_string(),
                color: "#ffffff".to_string(),
                opacity: 1.0,
                image_path: None,
                fit_mode: "cover".to_string(),
            },
            confirm_before_shutdown: true,
            minimize_to_tray: true,
        }
    }
}

fn get_config_path(app: &AppHandle) -> PathBuf {
    let mut path = app
        .path()
        .app_config_dir()
        .expect("failed to get app config dir");
    let _ = fs::create_dir_all(&path);
    path.push("config.json");
    path
}

#[tauri::command]
pub async fn load_config(app: AppHandle) -> Result<AppConfig, String> {
    let path = get_config_path(&app);
    if path.exists() {
        let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
        let config: AppConfig = serde_json::from_str(&content).unwrap_or_default();
        Ok(config)
    } else {
        let config = AppConfig::default();
        let _ = save_config_inner(&app, &config);
        Ok(config)
    }
}

#[tauri::command]
pub async fn save_config(app: AppHandle, config: AppConfig) -> Result<(), String> {
    save_config_inner(&app, &config)
}

fn save_config_inner(app: &AppHandle, config: &AppConfig) -> Result<(), String> {
    let path = get_config_path(app);
    let content = serde_json::to_string_pretty(config).map_err(|e| e.to_string())?;
    fs::write(&path, content).map_err(|e| e.to_string())?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_config() {
        let config = AppConfig::default();
        assert_eq!(config.background.bg_type, "color");
        assert_eq!(config.background.color, "#ffffff");
        assert_eq!(config.background.opacity, 1.0);
        assert!(config.confirm_before_shutdown);
        assert!(config.minimize_to_tray);
    }

    #[test]
    fn test_config_serialization() {
        let config = AppConfig::default();
        let json = serde_json::to_string(&config).unwrap();
        let deserialized: AppConfig = serde_json::from_str(&json).unwrap();
        assert_eq!(deserialized.background.color, config.background.color);
        assert_eq!(deserialized.confirm_before_shutdown, config.confirm_before_shutdown);
    }
}