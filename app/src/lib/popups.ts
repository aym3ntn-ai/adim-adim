// Chooses which review pop-ups the phone may show, and packs the schedule
// handed to the native side. Kept free of React Native so it can be tested.

import type { Popup, PopupType } from '../content/types';

export const POPUP_TYPES: PopupType[] = ['nouveau_mot', 'regle', 'rappel', 'beau_mot'];

export const TYPE_LABEL: Record<PopupType, string> = {
  nouveau_mot: 'Nouveau mot',
  regle: 'Règle',
  rappel: 'Rappel',
  beau_mot: 'Beau mot',
};

export interface PopupPrefs {
  enabled: boolean;
  intervalMinutes: number;
  types: Record<PopupType, boolean>;
  onlySeen: boolean;
  /** Quiet hours as [start, end) in whole hours; null shows pop-ups at any hour. */
  quiet: [number, number] | null;
}

export interface NativeItem {
  id: string;
  type: PopupType;
  tag: string;
  title: string;
  text: string;
}

export interface NativeConfig {
  enabled: boolean;
  intervalMinutes: number;
  quietStart: number;
  quietEnd: number;
  durationMs: number;
  items: NativeItem[];
}

export const DISPLAY_MS = 5000;

/**
 * Pop-ups of the enabled types. With onlySeen, lesson pop-ups appear once their
 * lesson has been opened; general ones (no lesson) always qualify.
 */
export function selectPopups(all: Popup[], prefs: Pick<PopupPrefs, 'types' | 'onlySeen'>, seen: ReadonlySet<string>): Popup[] {
  return all.filter((p) => prefs.types[p.type] && (p.lecon === null || !prefs.onlySeen || seen.has(p.lecon)));
}

export function toNativeItem(p: Popup): NativeItem {
  return { id: p.id, type: p.type, tag: TYPE_LABEL[p.type], title: p.titre, text: p.texte };
}

export function buildConfig(all: Popup[], prefs: PopupPrefs, seen: ReadonlySet<string>): NativeConfig {
  const items = selectPopups(all, prefs, seen).map(toNativeItem);
  return {
    enabled: prefs.enabled && items.length > 0,
    intervalMinutes: Math.max(15, Math.round(prefs.intervalMinutes)),
    quietStart: prefs.quiet ? prefs.quiet[0] : -1,
    quietEnd: prefs.quiet ? prefs.quiet[1] : -1,
    durationMs: DISPLAY_MS,
    items,
  };
}

/** True when `hour` (0–23) falls inside the quiet range, which may cross midnight. */
export function inQuietHours(hour: number, quiet: [number, number] | null): boolean {
  if (!quiet) return false;
  const [start, end] = quiet;
  if (start === end) return false;
  return start < end ? hour >= start && hour < end : hour >= start || hour < end;
}
