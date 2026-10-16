import { radii } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { T } from './T';
import { Tap } from './Tap';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'good' | 'warm';
  disabled?: boolean;
  flex?: boolean;
}

/** Full-width 56 px action button. */
export function Button({ label, onPress, variant = 'primary', disabled, flex }: Props) {
  const theme = useTheme();
  const look = {
    primary: { bg: theme.accent, border: theme.accent, text: theme.onAccent },
    good: { bg: theme.good, border: theme.good, text: theme.bg },
    outline: { bg: theme.surface, border: theme.line, text: theme.accent },
    warm: { bg: theme.surface, border: theme.warm, text: theme.warmInk },
  }[variant];
  return (
    <Tap
      label={label}
      onPress={onPress}
      disabled={disabled}
      style={{
        flex: flex ? 1 : undefined,
        minHeight: 56,
        borderRadius: radii.tile + 4,
        borderWidth: variant === 'warm' ? 2 : 1,
        borderColor: look.border,
        backgroundColor: look.bg,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
      }}>
      <T variant="bodyStrong" color={look.text} style={{ fontSize: 16 }}>
        {label}
      </T>
    </Tap>
  );
}
