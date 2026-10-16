import { router } from 'expo-router';
import { ChevronLeft, X } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { TOUCH, radii } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { T } from './T';
import { Tap } from './Tap';

interface Props {
  label?: string;
  /** "close" for full-screen practice, "back" for regular pages. */
  kind?: 'back' | 'close';
  right?: ReactNode;
  children?: ReactNode;
}

/** Round back button, an optional small label, and room for a progress bar. */
export function Header({ label, kind = 'back', right, children }: Props) {
  const theme = useTheme();
  const Icon = kind === 'close' ? X : ChevronLeft;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
      <Tap
        label={kind === 'close' ? 'Fermer' : 'Retour'}
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        style={{ width: TOUCH, height: TOUCH, borderRadius: radii.pill, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.line, alignItems: 'center', justifyContent: 'center' }}>
        <Icon color={theme.ink} size={22} strokeWidth={2.2} />
      </Tap>
      {children ?? (
        <T variant="label" color={theme.ink3} style={{ flex: 1 }}>
          {label}
        </T>
      )}
      {right}
    </View>
  );
}
