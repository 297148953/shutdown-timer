use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use std::time::Duration;
use tauri::{AppHandle, Emitter};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum TimerMode {
    Countdown,
    Scheduled,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum TimerStatus {
    Idle,
    Running,
    Paused,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TimerState {
    pub mode: Option<TimerMode>,
    pub status: TimerStatus,
    pub remaining_seconds: u64,
    pub total_seconds: Option<u64>,
    pub target_timestamp: Option<i64>,
}

impl Default for TimerState {
    fn default() -> Self {
        Self {
            mode: None,
            status: TimerStatus::Idle,
            remaining_seconds: 0,
            total_seconds: None,
            target_timestamp: None,
        }
    }
}

pub struct AppTimer {
    state: Mutex<TimerState>,
    cancel_tx: Mutex<Option<tokio::sync::oneshot::Sender<()>>>,
}

impl AppTimer {
    pub fn new() -> Self {
        Self {
            state: Mutex::new(TimerState::default()),
            cancel_tx: Mutex::new(None),
        }
    }

    pub fn get_state(&self) -> TimerState {
        self.state.lock().unwrap().clone()
    }

    fn start_ticker(app: AppHandle, timer: Arc<AppTimer>) {
        let (tx, mut rx) = tokio::sync::oneshot::channel::<()>();
        {
            let mut cancel = timer.cancel_tx.lock().unwrap();
            *cancel = Some(tx);
        }

        tauri::async_runtime::spawn(async move {
            loop {
                tokio::select! {
                    _ = &mut rx => {
                        break;
                    }
                    _ = tokio::time::sleep(Duration::from_secs(1)) => {
                        let mut state = timer.state.lock().unwrap();
                        if state.status != TimerStatus::Running {
                            continue;
                        }

                        if state.remaining_seconds > 0 {
                            state.remaining_seconds -= 1;
                            let remaining = state.remaining_seconds;
                            drop(state);

                            let _ = app.emit("timer_tick", serde_json::json!({ "remaining": remaining }));
                        } else {
                            drop(state);
                            let _ = app.emit("timer_finished", ());
                            break;
                        }
                    }
                }
            }
        });
    }
}

#[tauri::command]
pub async fn start_countdown(
    app: AppHandle,
    state: tauri::State<'_, Arc<AppTimer>>,
    minutes: u64,
) -> Result<TimerState, String> {
    let total_seconds = minutes * 60;
    {
        let mut s = state.state.lock().unwrap();
        s.mode = Some(TimerMode::Countdown);
        s.status = TimerStatus::Running;
        s.remaining_seconds = total_seconds;
        s.total_seconds = Some(total_seconds);
        s.target_timestamp = None;
    }

    AppTimer::start_ticker(app, state.inner().clone());
    Ok(state.get_state())
}

#[tauri::command]
pub async fn start_scheduled(
    app: AppHandle,
    state: tauri::State<'_, Arc<AppTimer>>,
    hour: u32,
    minute: u32,
) -> Result<TimerState, String> {
    use chrono::{Duration, Local, Timelike};

    let now = Local::now();
    let mut target = now
        .with_hour(hour)
        .and_then(|t| t.with_minute(minute))
        .and_then(|t| t.with_second(0))
        .ok_or("invalid time")?;

    if target <= now {
        target = target + Duration::days(1);
    }

    let remaining = (target - now).num_seconds() as u64;

    {
        let mut s = state.state.lock().unwrap();
        s.mode = Some(TimerMode::Scheduled);
        s.status = TimerStatus::Running;
        s.remaining_seconds = remaining;
        s.total_seconds = Some(remaining);
        s.target_timestamp = Some(target.timestamp());
    }

    AppTimer::start_ticker(app, state.inner().clone());
    Ok(state.get_state())
}

#[tauri::command]
pub async fn cancel_timer(
    state: tauri::State<'_, Arc<AppTimer>>,
) -> Result<TimerState, String> {
    {
        let mut cancel = state.cancel_tx.lock().unwrap();
        if let Some(tx) = cancel.take() {
            let _ = tx.send(());
        }
    }

    {
        let mut s = state.state.lock().unwrap();
        s.mode = None;
        s.status = TimerStatus::Idle;
        s.remaining_seconds = 0;
        s.total_seconds = None;
        s.target_timestamp = None;
    }

    Ok(state.get_state())
}

#[tauri::command]
pub async fn pause_timer(
    state: tauri::State<'_, Arc<AppTimer>>,
) -> Result<TimerState, String> {
    let mut s = state.state.lock().unwrap();
    if s.status == TimerStatus::Running {
        s.status = TimerStatus::Paused;
    }
    Ok(s.clone())
}

#[tauri::command]
pub async fn resume_timer(
    app: AppHandle,
    state: tauri::State<'_, Arc<AppTimer>>,
) -> Result<TimerState, String> {
    let should_start = {
        let mut s = state.state.lock().unwrap();
        if s.status == TimerStatus::Paused && s.remaining_seconds > 0 {
            s.status = TimerStatus::Running;
            true
        } else {
            false
        }
    };

    if should_start {
        AppTimer::start_ticker(app, state.inner().clone());
    }

    Ok(state.get_state())
}

#[tauri::command]
pub async fn get_timer_status(
    state: tauri::State<'_, Arc<AppTimer>>,
) -> Result<TimerState, String> {
    Ok(state.get_state())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_initial_state() {
        let timer = AppTimer::new();
        let state = timer.get_state();
        assert_eq!(state.status, TimerStatus::Idle);
        assert!(state.mode.is_none());
        assert_eq!(state.remaining_seconds, 0);
    }

    #[test]
    fn test_timer_state_clone() {
        let timer = AppTimer::new();
        let state1 = timer.get_state();
        let state2 = timer.get_state();
        assert_eq!(state1.status, state2.status);
    }
}