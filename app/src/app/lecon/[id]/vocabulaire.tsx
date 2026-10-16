import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Button } from '@/components/Button';
import { Flashcards } from '@/components/Flashcards';
import { Header } from '@/components/Header';
import { Screen } from '@/components/Screen';
import { SpeakButton } from '@/components/SpeakButton';
import { T } from '@/components/T';
import { cardKey, lessonById } from '@/content';
import { useProgress } from '@/store/progress';
import { radii } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

export default function Vocabulary() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = lessonById(id);
  const complete = useProgress((s) => s.complete);
  const [known, setKnown] = useState<number | null>(null);

  const cards = useMemo(
    () => (lesson ? lesson.vocabulaire.map((v, i) => ({ key: cardKey(lesson.id, i), tr: v.tr, fr: v.fr })) : []),
    [lesson],
  );

  if (!lesson) return null;

  if (known === null) {
    return (
      <Flashcards
        cards={cards}
        label={`Leçon ${lesson.numero} · Vocabulaire`}
        onFinish={(n) => {
          complete(lesson.id, 'vocabulaire');
          setKnown(n);
        }}
      />
    );
  }

  return (
    <Screen
      footer={
        <View style={{ gap: 10 }}>
          <Button label="Passer à la grammaire" onPress={() => router.replace(`/lecon/${lesson.id}/grammaire`)} />
          <Button label="Revoir les cartes" variant="outline" onPress={() => setKnown(null)} />
        </View>
      }>
      <Header label={`Leçon ${lesson.numero} · Vocabulaire`} />
      <View style={{ backgroundColor: theme.goodSoft, borderRadius: radii.hero, padding: 20, gap: 4, marginBottom: 18 }}>
        <T variant="cardTitle" color={theme.good}>
          Aferin !
        </T>
        <T variant="body" color={theme.good}>
          {known} mot{known > 1 ? 's' : ''} sur {cards.length} déjà su{known > 1 ? 's' : ''}. Les autres reviendront dans la révision.
        </T>
      </View>
      <T variant="label" color={theme.ink3} style={{ marginBottom: 8 }}>
        Liste de la leçon
      </T>
      <View style={{ backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.line, borderRadius: radii.card, overflow: 'hidden' }}>
        {lesson.vocabulaire.map((v, i) => (
          <View key={v.tr} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderTopColor: theme.rowLine }}>
            <View style={{ flex: 1 }}>
              <T variant="rowTitle">{v.tr}</T>
              <T variant="caption" color={theme.ink3}>
                {v.fr}
              </T>
            </View>
            <SpeakButton text={v.tr} size={36} />
          </View>
        ))}
      </View>
    </Screen>
  );
}
