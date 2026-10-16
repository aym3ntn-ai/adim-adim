import { Volume2 } from 'lucide-react-native';
import { speak } from '@/lib/speak';
import { TOUCH, radii } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { Tap } from './Tap';

/** Small round button that reads Turkish text aloud. */
export function SpeakButton({ text, size = TOUCH }: { text: string; size?: number }) {
  const theme = useTheme();
  return (
    <Tap
      label={`Écouter : ${text}`}
      onPress={() => speak(text)}
      hitSlop={size < TOUCH ? (TOUCH - size) / 2 : 0}
      style={{ width: size, height: size, borderRadius: radii.pill, borderWidth: 1, borderColor: theme.line, backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center' }}>
      <Volume2 color={theme.accent} size={Math.round(size * 0.45)} strokeWidth={2} />
    </Tap>
  );
}
