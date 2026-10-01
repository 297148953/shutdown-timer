import { create } from 'zustand';
import { ipc } from '../services/ipc';
import type { AppConfig, BackgroundConfig } from '../types';

interface ConfigStore extends AppConfig {
  init: () => Promise<void>;
  setBackground: (bg: Partial<BackgroundConfig>) => Promise<void>;
  setConfirmBeforeShutdown: (value: boolean) => Promise<void>;
  setMinimizeToTray: (value: boolean) => Promise<void>;
}

export const useConfigStore = create<ConfigStore>((set, get) => ({
  background: {
    bgType: 'color',
    color: '#ffffff',
    opacity: 1,
    imagePath: undefined,
    fitMode: 'cover',
  },
  confirmBeforeShutdown: true,
  minimizeToTray: true,

  async init() {
    try {
      const config = await ipc.loadConfig();
      set({
        background: config.background,
        confirmBeforeShutdown: config.confirmBeforeShutdown,
        minimizeToTray: config.minimizeToTray,
      });
    } catch (e) {
      console.error('Failed to load config:', e);
    }
  },

  async setBackground(bg: Partial<BackgroundConfig>) {
    const current = get().background;
    const newBg = { ...current, ...bg };
    set({ background: newBg });

    const currentConfig = get();
    try {
      await ipc.saveConfig({
        background: currentConfig.background,
        confirmBeforeShutdown: currentConfig.confirmBeforeShutdown,
        minimizeToTray: currentConfig.minimizeToTray,
      });
    } catch (e) {
      console.error('Failed to save config:', e);
    }
  },

  async setConfirmBeforeShutdown(value: boolean) {
    set({ confirmBeforeShutdown: value });
    const current = get();
    try {
      await ipc.saveConfig({
        background: current.background,
        confirmBeforeShutdown: value,
        minimizeToTray: current.minimizeToTray,
      });
    } catch (e) {
      console.error('Failed to save config:', e);
    }
  },

  async setMinimizeToTray(value: boolean) {
    set({ minimizeToTray: value });
    const current = get();
    try {
      await ipc.saveConfig({
        background: current.background,
        confirmBeforeShutdown: current.confirmBeforeShutdown,
        minimizeToTray: value,
      });
    } catch (e) {
      console.error('Failed to save config:', e);
    }
  },
}));
