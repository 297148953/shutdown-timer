import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import type { AppConfig, TimerState, TimerTickPayload } from '../types';

export const ipc = {
  async loadConfig(): Promise<AppConfig> {
    return invoke<AppConfig>('load_config');
  },

  async saveConfig(config: AppConfig): Promise<void> {
    return invoke<void>('save_config', { config });
  },

  async shutdownNow(): Promise<void> {
    return invoke<void>('shutdown_now');
  },

  async cancelSystemShutdown(): Promise<void> {
    return invoke<void>('cancel_system_shutdown');
  },

  async startCountdown(minutes: number): Promise<TimerState> {
    return invoke<TimerState>('start_countdown', { minutes });
  },

  async startScheduled(hour: number, minute: number): Promise<TimerState> {
    return invoke<TimerState>('start_scheduled', { hour, minute });
  },

  async cancelTimer(): Promise<TimerState> {
    return invoke<TimerState>('cancel_timer');
  },

  async pauseTimer(): Promise<TimerState> {
    return invoke<TimerState>('pause_timer');
  },

  async resumeTimer(): Promise<TimerState> {
    return invoke<TimerState>('resume_timer');
  },

  async getTimerStatus(): Promise<TimerState> {
    return invoke<TimerState>('get_timer_status');
  },

  async exitApp(): Promise<void> {
    return invoke<void>('exit_app');
  },

  async hideWindow(): Promise<void> {
    return invoke<void>('hide_window');
  },

  async showWindow(): Promise<void> {
    return invoke<void>('show_window');
  },

  async onTimerTick(callback: (remaining: number) => void): Promise<() => void> {
    const unlisten = await listen<TimerTickPayload>('timer_tick', (event) => {
      callback(event.payload.remaining);
    });
    return () => unlisten();
  },

  async onTimerFinished(callback: () => void): Promise<() => void> {
    const unlisten = await listen<void>('timer_finished', () => {
      callback();
    });
    return () => unlisten();
  },

  async onTrayCancelTimer(callback: () => void): Promise<() => void> {
    const unlisten = await listen<void>('tray_cancel_timer', () => {
      callback();
    });
    return () => unlisten();
  },

  async onTrayShutdownRequested(callback: () => void): Promise<() => void> {
    const unlisten = await listen<void>('tray_shutdown_requested', () => {
      callback();
    });
    return () => unlisten();
  },
};
