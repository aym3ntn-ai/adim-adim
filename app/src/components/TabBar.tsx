import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { House, Layers, Settings, type LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { T } from './T';
import { Tap } from './Tap';

const TABS: Record<string, { label: string; icon: LucideIcon }> = {
  index: { label: 'Accueil', icon: House },
  revision: { label: 'Révision', icon: Layers },
  settings: { label: 'Réglages', icon: Settings },
};

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      accessibilityRole="tablist"
      style={{ flexDirection: 'row', backgroundColor: theme.surface, borderTopWidth: 1, borderTopColor: theme.line, paddingBottom: insets.bottom }}>
      {state.routes.map((route, index) => {
        const tab = TABS[route.name];
        if (!tab) return null;
        const active = state.index === index;
        const color = active ? theme.accent : theme.ink3;
        const Icon = tab.icon;
        return (
          <Tap
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            label={tab.label}
            onPress={() => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!event.defaultPrevented) navigation.navigate(route.name, route.params);
            }}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, minHeight: 60, paddingTop: 8, paddingBottom: 6 }}>
            <Icon color={color} size={24} strokeWidth={active ? 2.2 : 1.8} />
            <T variant="caption" color={color} style={{ fontFamily: active ? fonts.bold : fonts.medium, fontSize: 12 }}>
              {tab.label}
            </T>
          </Tap>
        );
      })}
    </View>
  );
}
