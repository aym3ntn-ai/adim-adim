import { create } from 'zustand';
import type { NativeItem } from '@/lib/popups';

interface WebPopupState {
  item: NativeItem | null;
  /** Bumped on every pop-up so the same one can be shown twice in a row. */
  key: number;
  show: (item: NativeItem) => void;
  hide: () => void;
}

/** The in-page review pop-up of the web version (Android draws its own over other apps). */
export const useWebPopup = create<WebPopupState>((set) => ({
  item: null,
  key: 0,
  show: (item) => set((s) => ({ item, key: s.key + 1 })),
  hide: () => set({ item: null }),
}));
