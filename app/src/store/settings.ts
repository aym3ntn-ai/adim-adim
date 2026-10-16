import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PopupPrefs } from '@/lib/popups';
import { storage } from './storage';

export type ThemeChoice = 'system' | 'light' | 'dark';

interface SettingsState {
  theme: ThemeChoice;
  /** Show the French translation under the dialogue lines. */
  showTranslation: boolean;
  popups: PopupPrefs;
  /** Web only: pop-ups appear while the site is open, so the pace is in minutes. */
  webIntervalMinutes: number;
  set: (patch: Partial<Omit<SettingsState, 'set' | 'setPopups'>>) => void;
  setPopups: (patch: Partial<PopupPrefs>) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'system',
      showTranslation: true,
      popups: {
        enabled: false,
        intervalMinutes: 120,
        types: { nouveau_mot: true, regle: true, rappel: true, beau_mot: true },
        onlySeen: true,
        quiet: [22, 8],
      },
      webIntervalMinutes: 10,
      set: (patch) => set(patch),
      setPopups: (patch) => set((s) => ({ popups: { ...s.popups, ...patch } })),
    }),
    { name: 'adimadim.settings', storage },
  ),
);
