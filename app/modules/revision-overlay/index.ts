import { requireOptionalNativeModule } from 'expo';

interface RevisionOverlayNative {
  canDrawOverlays(): boolean;
  openOverlaySettings(): void;
  configure(json: string): void;
  showNow(itemJson: string): boolean;
}

// Absent in Expo Go and on platforms other than Android: every call becomes a no-op.
const native = requireOptionalNativeModule<RevisionOverlayNative>('RevisionOverlay');

export const overlaySupported = native !== null;

export function canDrawOverlays(): boolean {
  return native?.canDrawOverlays() ?? false;
}

export function openOverlaySettings(): void {
  native?.openOverlaySettings();
}

export function configure(config: unknown): void {
  native?.configure(JSON.stringify(config));
}

export function showNow(item: unknown): boolean {
  return native?.showNow(JSON.stringify(item)) ?? false;
}
