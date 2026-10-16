import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { Button } from '@/components/Button';
import { Header } from '@/components/Header';
import { Screen } from '@/components/Screen';
import { SpeakButton } from '@/components/SpeakButton';
import { T } from '@/components/T';
import { lessonById } from '@/content';
import { useProgress } from '@/store/progress';
import { radii } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

export default function Grammar() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = lessonById(id);
  const complete = useProgress((s) => s.complete);
  if (!lesson) return null;

  const next = lesson.dialogue.length ? 'dialogue' : 'exercices';
  const finish = () => {
    complete(lesson.id, 'grammaire');
    // A lesson without dialogue counts that step as done too.
    if (!lesson.dialogue.length) complete(lesson.id, 'dialogue');
    router.replace(`/lecon/${lesson.id}/${next}`);
  };

  return (
    <Screen footer={<Button label={next === 'dialogue' ? "J'ai compris · Dialogue" : "J'ai compris · Exercices"} onPress={finish} />}>
      <Header label={`Leçon ${lesson.numero} · Grammaire`} />
      <T variant="screenTitle" accessibilityRole="header" style={{ marginBottom: 16 }}>
        {lesson.titre}
      </T>
      <View style={{ gap: 14 }}>
        {lesson.grammaire.map((g, i) => (
          <View key={g.titre} style={{ backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.line, borderRadius: radii.hero - 4, padding: 16, gap: 10 }}>
            <T variant="label" color={theme.accent}>
              Point {i + 1}
            </T>
            <T variant="cardTitle">{g.titre}</T>
            <T variant="body" color={theme.ink2}>
              {g.explication}
            </T>
            {g.exemples.length ? (
              <View style={{ backgroundColor: theme.bg, borderRadius: radii.tile, overflow: 'hidden' }}>
                {g.exemples.map((e, j) => (
                  <View key={e.tr} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: j ? 1 : 0, borderTopColor: theme.rowLine }}>
                    <View style={{ flex: 1 }}>
                      <T variant="bodyStrong" color={theme.warmInk}>
                        {e.tr}
                      </T>
                      <T variant="caption" color={theme.ink3}>
                        {e.fr}
                      </T>
                    </View>
                    <SpeakButton text={e.tr.replace(/→.*$/, '').replace(/[—–].*$/, '').trim()} size={36} />
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        ))}
      </View>
    </Screen>
  );
}
