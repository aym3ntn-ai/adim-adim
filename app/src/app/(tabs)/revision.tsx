import { router } from 'expo-router';
import { Layers } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';
import { Button } from '@/components/Button';
import { Flashcards, type Card } from '@/components/Flashcards';
import { Screen } from '@/components/Screen';
import { T } from '@/components/T';
import { cardKey, lessons } from '@/content';
import { useProgress, type CardState } from '@/store/progress';
import { radii } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

const SESSION = 15;

function shuffle<V>(items: V[]): V[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/** Words of the lessons already opened: "à revoir" first, then new ones, then known ones. */
function buildSession(opened: string[], states: Record<string, CardState>): Card[] {
  const all = lessons
    .filter((l) => opened.includes(l.id))
    .flatMap((l) => l.vocabulaire.map((v, i) => ({ key: cardKey(l.id, i), tr: v.tr, fr: v.fr })));
  const rank = (c: Card) => (states[c.key] === 'review' ? 0 : states[c.key] === undefined ? 1 : 2);
  return shuffle(all)
    .sort((a, b) => rank(a) - rank(b))
    .slice(0, SESSION);
}

export default function Revision() {
  const theme = useTheme();
  const progress = useProgress();
  const opened = Object.keys(progress.lessons);
  const [session, setSession] = useState<Card[] | null>(null);
  const [result, setResult] = useState<{ known: number; total: number } | null>(null);

  if (session && !result) {
    return (
      <Flashcards
        cards={session}
        label="Révision · mots des leçons vues"
        onFinish={(known) => setResult({ known, total: session.length })}
      />
    );
  }

  const toReview = Object.values(progress.cards).filter((c) => c === 'review').length;
  const start = () => {
    setResult(null);
    setSession(buildSession(opened, progress.cards));
  };

  return (
    <Screen>
      <T variant="screenTitle" accessibilityRole="header" style={{ marginBottom: 16 }}>
        Révision
      </T>

      {result ? (
        <View style={{ backgroundColor: theme.goodSoft, borderRadius: radii.hero, padding: 20, gap: 6, marginBottom: 16 }}>
          <T variant="cardTitle" color={theme.good}>
            Aferin ! Série terminée.
          </T>
          <T variant="body" color={theme.good}>
            {result.known} mot{result.known > 1 ? 's' : ''} sur {result.total} déjà su{result.known > 1 ? 's' : ''}.
          </T>
        </View>
      ) : null}

      <View style={{ backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.line, borderRadius: radii.hero, padding: 20, gap: 14 }}>
        <View style={{ width: 52, height: 52, borderRadius: radii.tile, backgroundColor: theme.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
          <Layers color={theme.accent} size={26} strokeWidth={2} />
        </View>
        {opened.length === 0 ? (
          <>
            <T variant="body" color={theme.ink2}>
              Les cartes de révision reprennent le vocabulaire des leçons que vous avez ouvertes. Commencez par la première leçon.
            </T>
            <Button label="Ouvrir la leçon 1" onPress={() => router.push('/lecon/L01')} />
          </>
        ) : (
          <>
            <T variant="body" color={theme.ink2}>
              {SESSION} cartes au plus, tirées de {opened.length} leçon{opened.length > 1 ? 's' : ''}. Les mots marqués « À revoir » passent en premier
              {toReview ? ` (${toReview} en attente)` : ''}.
            </T>
            <Button label={result ? 'Nouvelle série' : 'Commencer une série'} onPress={start} />
          </>
        )}
      </View>
    </Screen>
  );
}
