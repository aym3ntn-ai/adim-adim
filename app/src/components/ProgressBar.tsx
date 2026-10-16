import { View } from 'react-native';
import { radii } from '@/theme/tokens';

interface Props {
  value: number;
  color: string;
  track: string;
  height?: number;
}

export function ProgressBar({ value, color, track, height = 8 }: Props) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct) }}
      style={{ flex: 1, height, borderRadius: radii.pill, backgroundColor: track, overflow: 'hidden' }}>
      <View style={{ width: `${pct}%`, height, borderRadius: radii.pill, backgroundColor: color }} />
    </View>
  );
}
