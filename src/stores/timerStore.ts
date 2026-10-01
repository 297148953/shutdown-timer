import { create } from 'zustand';
import { ipc } from '../services/ipc';
import type { TimerState, TimerStatus } from '../types';

interface TimerStore extends TimerState {
  init: () => Promise<void>;
  startCountdown: (minutes: number) => Promise<void>;
  startScheduled: (hour: number, minute: number) => Promise<void>;
  cancel: () => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  setRemaining: (seconds: number) => void;
}

export const useTimerStore = create<TimerStore>((set) => ({
  mode: null,
  status: 'idle' as TimerStatus,
  remainingSeconds: 0,
  totalSeconds: undefined,
  targetTimestamp: undefined,

  async init() {
    try {
      const state = await ipc.getTimerStatus();
      set({
        mode: state.mode,
        status: state.status,
        remainingSeconds: state.remainingSeconds,
        totalSeconds: state.totalSeconds,
        targetTimestamp: state.targetTimestamp,
      });
    } catch (e) {
      console.error('Failed to get timer status:', e);
    }
  },

  async startCountdown(minutes: number) {
    const state = await ipc.startCountdown(minutes);
    set({
      mode: state.mode,
      status: state.status,
      remainingSeconds: state.remainingSeconds,
      totalSeconds: state.totalSeconds,
      targetTimestamp: state.targetTimestamp,
    });
  },

  async startScheduled(hour: number, minute: number) {
    const state = await ipc.startScheduled(hour, minute);
    set({
      mode: state.mode,
      status: state.status,
      remainingSeconds: state.remainingSeconds,
      totalSeconds: state.totalSeconds,
      targetTimestamp: state.targetTimestamp,
    });
  },

  async cancel() {
    const state = await ipc.cancelTimer();
    set({
      mode: state.mode,
      status: state.status,
      remainingSeconds: state.remainingSeconds,
      totalSeconds: state.totalSeconds,
      targetTimestamp: state.targetTimestamp,
    });
  },

  async pause() {
    const state = await ipc.pauseTimer();
    set({ status: state.status });
  },

  async resume() {
    const state = await ipc.resumeTimer();
    set({ status: state.status });
  },

  setRemaining(seconds: number) {
    set({ remainingSeconds: seconds });
  },
}));
