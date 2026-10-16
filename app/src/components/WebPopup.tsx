import { X } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { popups } from '@/content';
import { DISPLAY_MS, inQuietHours, selectPopups, toNativeItem } from '@/lib/popups';
import { useProgress } from '@/store/progress';
import { useSettings } from '@/store/settings';
import { useWebPopup } from '@/store/webPopup';
import { fonts, radii } from '@/theme/tokens';
import { T } from './T';
import { Tap } from './Tap';

// Same look as the Android pop-up: a light card in both themes.
const LOOK = {
  nouveau_mot: { avatar: '#1F4E8C', avatarText: '#FFFFFF', tag: '#1F4E8C', bar: '#1F4E8C' },
  regle: { avatar: '#24613A', avatarText: '#FFFFFF', tag: '#24613A', bar: '#24613A' },
  rappel: { avatar: '#EEE9E1', avatarText: '#1B1F2A', tag: '#5B6170', bar: '#5B6170' },
  beau_mot: { avatar: '#F2B38F', avatarText: '#5A2410', tag: '#A8441C', bar: '#C8572B' },
} as const;

/** While the site is open and visible, picks a pop-up at the chosen pace. */
function useWebPopupTimer() {
  const prefs = useSettings((s) => s.popups);
  const minutes = useSettings((s) => s.webIntervalMinutes);
  const lessons = useProgress((s) => s.lessons);
  const show = useWebPopup((s) => s.show);
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (!prefs.enabled) return;
    const timer = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
      if (inQuietHours(new Date().getHours(), prefs.quiet)) return;
      const pool = selectPopups(popups, prefs, new Set(Object.keys(lessons))).filter((p) => p.id !== last.current);
      const pick = pool[Math.floor(Math.random() * pool.length)];
      if (!pick) return;
      last.current = pick.id;
      show(toNativeItem(pick));
    }, minutes * 60_000);
    return () => clearInterval(timer);
  }, [prefs, minutes, lessons, show]);
}

/** In-page pop-up of the web version: shown 5 seconds, then it slides away. Mounted once in the root layout. */
export function WebPopup() {
  useWebPopupTimer();
  const insets = useSafeAreaInsets();
  const { item, key, hide } = useWebPopup();
  const enter = useRef(new Animated.Value(0)).current;
  const drain = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!item) return;
    enter.setValue(0);
    drain.setValue(1);
    Animated.timing(enter, { toValue: 1, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
    Animated.timing(drain, { toValue: 0, duration: DISPLAY_MS, easing: Easing.linear, useNativeDriver: false }).start();
    const timer = setTimeout(() => {
      Animated.timing(enter, { toValue: 0, duration: 220, useNativeDriver: false }).start(() => hide());
    }, DISPLAY_MS);
    return () => clearTimeout(timer);
  }, [item, key, enter, drain, hide]);

  if (!item) return null;
  const look = LOOK[item.type];

  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      style={{
        position: 'absolute',
        top: insets.top + 10,
        left: 12,
        right: 12,
        alignItems: 'center',
        opacity: enter,
        transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
      }}>
      <View
        style={{
          width: '100%',
          maxWidth: 440,
          backgroundColor: '#FFFFFF',
          borderRadius: radii.hero - 2,
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOpacity: 0.22,
          shadowRadius: 22,
          shadowOffset: { width: 0, height: 10 },
          elevation: 10,
        }}>
        <View style={{ flexDirection: 'row', gap: 12, paddingLeft: 14, paddingTop: 14, paddingBottom: 12, paddingRight: 4 }}>
          <View style={{ width: 44, height: 44, borderRadius: radii.pill, backgroundColor: look.avatar, alignItems: 'center', justifyContent: 'center' }}>
            <T variant="bodyStrong" color={look.avatarText} style={{ fontFamily: fonts.display, fontSize: 17 }}>
              tr
            </T>
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <T variant="label" color={look.tag}>
              {item.tag}
            </T>
            <T variant="cardTitle" color="#1B1F2A">
              {item.title}
            </T>
            <T variant="caption" color="#3A3F4B" style={{ fontSize: 14, lineHeight: 20 }}>
              {item.text}
            </T>
          </View>
          <Tap label="Fermer" onPress={hide} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
            <X color="#5B6170" size={20} strokeWidth={2.2} />
          </Tap>
        </View>
        <View style={{ height: 4, backgroundColor: '#EEE9E1' }}>
          <Animated.View
            style={{ height: 4, backgroundColor: look.bar, width: drain.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }}
          />
        </View>
      </View>
    </Animated.View>
  );
}
