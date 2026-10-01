export type TimerMode = 'countdown' | 'scheduled' | null;
export type TimerStatus = 'idle' | 'running' | 'paused';

export interface TimerState {
  mode: TimerMode;
  status: TimerStatus;
  remainingSeconds: number;
  totalSeconds?: number;
  targetTimestamp?: number;
}

export interface BackgroundConfig {
  bgType: 'color' | 'image';
  color: string;
  opacity: number;
  imagePath?: string;
  fitMode: 'stretch' | 'center' | 'cover' | 'contain';
}

export interface AppConfig {
  background: BackgroundConfig;
  confirmBeforeShutdown: boolean;
  minimizeToTray: boolean;
}

export interface TimerTickPayload {
  remaining: number;
}
