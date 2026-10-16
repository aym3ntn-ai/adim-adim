import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { space } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

interface Props {
  children: ReactNode;
  /** Pinned under the scrolling content, above the system navigation bar. */
  footer?: ReactNode;
  scroll?: boolean;
}

/** Page with the standard padding, below the system status bar. */
export function Screen({ children, footer, scroll = true }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const inner = { paddingTop: insets.top + 14, paddingHorizontal: space.screen, width: '100%' as const, maxWidth: 720, alignSelf: 'center' as const };
  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      {scroll ? (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ ...inner, paddingBottom: 32 }}>
          {children}
        </ScrollView>
      ) : (
        <View style={{ ...inner, flex: 1 }}>{children}</View>
      )}
      {footer ? (
        <View style={{ paddingHorizontal: space.screen, paddingTop: 10, paddingBottom: insets.bottom + 14, width: '100%', maxWidth: 720, alignSelf: 'center' }}>
          {footer}
        </View>
      ) : null}
    </View>
  );
}
