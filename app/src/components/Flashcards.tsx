import { useState } from 'react';
import { View } from 'react-native';
import { speak } from '@/lib/speak';
import { useProgress } from '@/store/progress';
import { radii } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { Button } from './Button';
import { Header } from './Header';
import { ProgressBar } from './ProgressBar';
import { Screen } from './Screen';
import { SpeakButton } from './SpeakButton';
import { T } from './T';
import { Tap } from './Tap';

export interface Card {
  key: string;
  tr: string;
  fr: string;
}

interface Props {
  cards: Card[];
  label: string;
  onFinish: (known: number) => void;
}

/** One card at a time: Turkish first, tap to see the French, then grade it. */
export function Flashcards({ cards, label, onFinish }: Props) {
  const theme = useTheme();
  const grade = useProgress((s) => s.grade);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [known, setKnown] = useState(0);
  const card = cards[index];

  const next = (isKnown: boolean) => {
    if (!card) return;
    grade(card.key, isKnown ? 'known' : 'review');
    const total = known + (isKnown ? 1 : 0);
    setKnown(total);
    setRevealed(false);
    if (index + 1 >= cards.length) onFinish(total);
    else setIndex(index + 1);
  };

  if (!card) return null;

  return (
    <Screen
      scroll={false}
      footer={
        revealed ? (
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Button label="À revoir" variant="warm" onPress={() => next(false)} flex />
            <Button label="Je savais" onPress={() => next(true)} flex />
          </View>
        ) : (
          <Button label="Voir la traduction" variant="outline" onPress={() => setRevealed(true)} />
        )
      }>
      <Header kind="close">
        <ProgressBar value={(index + (revealed ? 0.5 : 0)) / cards.length} color={theme.accent} track={theme.line} />
        <T variant="bodyStrong" color={theme.ink3}>
          {index + 1}/{cards.length}
        </T>
      </Header>
      <T variant="label" color={theme.ink3} style={{ marginBottom: 14 }}>
        {label}
      </T>

      <Tap
        label={revealed ? undefined : 'Voir la traduction'}
        onPress={() => (revealed ? speak(card.tr) : setRevealed(true))}
        style={{ flex: 1, marginBottom: 6, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.line, borderRadius: radii.hero + 4, padding: 24, justifyContent: 'space-between', elevation: 3, shadowColor: '#1B1F2A', shadowOpacity: 0.08, shadowRadius: 18, shadowOffset: { width: 0, height: 10 } }}>
        <View style={{ alignItems: 'flex-end' }}>
          <SpeakButton text={card.tr} />
        </View>
        <View style={{ alignItems: 'center', gap: 10 }}>
          <T variant="word" style={{ textAlign: 'center' }}>
            {card.tr}
          </T>
        </View>
        <View style={{ minHeight: 90, alignItems: 'center', justifyContent: 'center', borderTopWidth: 1, borderStyle: 'dashed', borderTopColor: theme.line, paddingTop: 18 }}>
          {revealed ? (
            <T variant="cardTitle" color={theme.warmInk} style={{ textAlign: 'center' }}>
              {card.fr}
            </T>
          ) : (
            <T variant="caption" color={theme.ink3}>
              Touchez la carte pour voir la traduction
            </T>
          )}
        </View>
      </Tap>
    </Screen>
  );
}
