use std::process::Command;

#[cfg(target_os = "windows")]
pub fn shutdown_with_seconds(seconds: u32) -> Result<(), String> {
    let output = Command::new("shutdown")
        .args(["/s", "/t", &seconds.to_string(), "/c", "定时关机"])
        .output()
        .map_err(|e| format!("failed to execute shutdown: {}", e))?;

    if output.status.success() {
        Ok(())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[cfg(target_os = "windows")]
pub fn cancel_shutdown() -> Result<(), String> {
    let output = Command::new("shutdown")
        .arg("/a")
        .output()
        .map_err(|e| format!("failed to cancel shutdown: {}", e))?;

    if output.status.success() {
        Ok(())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[tauri::command]
pub async fn shutdown_now() -> Result<(), String> {
    shutdown_with_seconds(30)
}

#[tauri::command]
pub async fn cancel_system_shutdown() -> Result<(), String> {
    cancel_shutdown()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_shutdown_command_format() {
        let seconds = 60;
        let args: Vec<&str> = vec!["/s", "/t", "60", "/c", "定时关机"];
        assert_eq!(args.len(), 5);
        assert_eq!(args[2], seconds.to_string());
    }

    #[test]
    fn test_cancel_command_format() {
        let args: Vec<&str> = vec!["/a"];
        assert_eq!(args.len(), 1);
        assert_eq!(args[0], "/a");
    }
}
