import { useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';
import { canDrawOverlays, configure, overlaySupported } from '../../modules/revision-overlay';
import { popups } from '@/content';
import { buildConfig } from '@/lib/popups';
import { useProgress } from '@/store/progress';
import { useSettings } from '@/store/settings';

/** Hands the current schedule and pop-up list to Android whenever they change. */
export function useOverlaySync(): void {
  const prefs = useSettings((s) => s.popups);
  const lessons = useProgress((s) => s.lessons);
  const seenKey = Object.keys(lessons).sort().join(',');

  const config = useMemo(
    () => buildConfig(popups, prefs, new Set(seenKey ? seenKey.split(',') : [])),
    [prefs, seenKey],
  );

  useEffect(() => {
    if (overlaySupported) configure(config);
  }, [config]);
}

/** Whether the "display over other apps" permission is granted, re-read when the app comes back. */
export function useOverlayPermission(): boolean {
  const [granted, setGranted] = useState(canDrawOverlays);
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') setGranted(canDrawOverlays());
    });
    return () => sub.remove();
  }, []);
  return granted;
}
