import { router, useLocalSearchParams } from 'expo-router';
import { Volume2 } from 'lucide-react-native';
import { useEffect } from 'react';
import { Switch, View } from 'react-native';
import { Button } from '@/components/Button';
import { Header } from '@/components/Header';
import { Screen } from '@/components/Screen';
import { T } from '@/components/T';
import { Tap } from '@/components/Tap';
import { lessonById } from '@/content';
import { speak, speakAll, stopSpeaking } from '@/lib/speak';
import { useProgress } from '@/store/progress';
import { useSettings } from '@/store/settings';
import { TOUCH, radii } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

export default function Dialogue() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = lessonById(id);
  const complete = useProgress((s) => s.complete);
  const showTranslation = useSettings((s) => s.showTranslation);
  const setSettings = useSettings((s) => s.set);

  useEffect(() => stopSpeaking, []);

  if (!lesson) return null;
  const first = lesson.dialogue[0]?.locuteur;

  const finish = () => {
    complete(lesson.id, 'dialogue');
    router.replace(`/lecon/${lesson.id}/exercices`);
  };

  return (
    <Screen
      footer={
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Tap
            label="Écouter tout le dialogue"
            onPress={() => speakAll(lesson.dialogue.map((d) => d.tr))}
            style={{ width: 56, height: 56, borderRadius: radii.tile + 4, borderWidth: 1, borderColor: theme.line, backgroundColor: theme.surface, alignItems: 'center', justifyContent: 'center' }}>
            <Volume2 color={theme.accent} size={24} strokeWidth={2} />
          </Tap>
          <Button label="Passer aux exercices" onPress={finish} flex />
        </View>
      }>
      <Header
        label="Dialogue"
        right={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: TOUCH }}>
            <T variant="bodyStrong" color={theme.ink2}>
              Traduction
            </T>
            <Switch
              value={showTranslation}
              onValueChange={(v) => setSettings({ showTranslation: v })}
              accessibilityLabel="Afficher la traduction"
              trackColor={{ false: theme.line, true: theme.accent }}
              thumbColor={theme.surface}
            />
          </View>
        }
      />
      <T variant="screenTitle" accessibilityRole="header" style={{ marginBottom: 16 }}>
        {lesson.titre}
      </T>

      {lesson.dialogue.length === 0 ? (
        <T variant="body" color={theme.ink3}>
          Cette leçon n&apos;a pas de dialogue. Passez directement aux exercices.
        </T>
      ) : null}

      <View style={{ gap: 12 }}>
        {lesson.dialogue.map((line, i) => {
          const mine = line.locuteur !== first;
          return (
            <View key={`${i}-${line.tr}`} style={{ alignItems: mine ? 'flex-end' : 'flex-start', gap: 4 }}>
              <T variant="caption" color={theme.ink3} style={{ fontWeight: '700', paddingHorizontal: 6 }}>
                {line.locuteur}
              </T>
              <Tap
                label={`${line.locuteur} : ${line.tr}. Toucher pour écouter.`}
                onPress={() => speak(line.tr)}
                style={{
                  maxWidth: '86%',
                  borderRadius: radii.hero - 6,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  gap: 4,
                  backgroundColor: mine ? theme.accent : theme.surface,
                  borderWidth: mine ? 0 : 1,
                  borderColor: theme.line,
                }}>
                <T variant="bodyStrong" color={mine ? theme.onAccent : theme.ink} style={{ fontSize: 16 }}>
                  {line.tr}
                </T>
                {showTranslation ? (
                  <T variant="caption" color={mine ? theme.onAccent : theme.ink3} style={{ opacity: mine ? 0.85 : 1 }}>
                    {line.fr}
                  </T>
                ) : null}
              </Tap>
            </View>
          );
        })}
      </View>
    </Screen>
  );
}
