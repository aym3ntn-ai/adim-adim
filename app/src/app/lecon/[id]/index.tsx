import { router, useLocalSearchParams } from 'expo-router';
import { Check, ChevronRight, Play } from 'lucide-react-native';
import { useEffect } from 'react';
import { Linking, View } from 'react-native';
import { Header } from '@/components/Header';
import { Screen } from '@/components/Screen';
import { T } from '@/components/T';
import { Tap } from '@/components/Tap';
import { lessonById, lessons } from '@/content';
import { SECTIONS, type Lesson, type Section } from '@/content/types';
import { useProgress } from '@/store/progress';
import { radii } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

const STEP: Record<Section, { label: string; detail: (l: Lesson) => string }> = {
  vocabulaire: { label: 'Vocabulaire', detail: (l) => `${l.vocabulaire.length} mots` },
  grammaire: { label: 'Grammaire', detail: (l) => `${l.grammaire.length} point${l.grammaire.length > 1 ? 's' : ''}` },
  dialogue: { label: 'Dialogue', detail: (l) => (l.dialogue.length ? `${l.dialogue.length} répliques` : 'Pas de dialogue dans cette leçon') },
  exercices: { label: 'Exercices', detail: (l) => `${l.exercices.length} questions` },
};

export default function LessonScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = lessonById(id);
  const open = useProgress((s) => s.open);
  const progress = useProgress((s) => s.lessons[id]);

  useEffect(() => {
    if (lesson) open(lesson.id);
  }, [lesson, open]);

  if (!lesson) {
    return (
      <Screen>
        <Header label="Leçon introuvable" />
      </Screen>
    );
  }

  const done = progress?.done ?? [];
  const nextStep = SECTIONS.find((s) => !done.includes(s));

  return (
    <Screen>
      <Header label={`Leçon ${lesson.numero} sur ${lessons.length}`} />
      <T variant="screenTitle" accessibilityRole="header">
        {lesson.titre}
      </T>
      <T variant="body" color={theme.ink3} style={{ fontStyle: 'italic', marginBottom: 18 }}>
        {lesson.titre_tr}
      </T>

      {lesson.videos.map((v) => (
        <Tap
          key={v.url}
          label={`Regarder la vidéo : ${v.titre}`}
          onPress={() => Linking.openURL(v.url)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: theme.ink, borderRadius: radii.card + 2, padding: 14, marginBottom: 12 }}>
          <View style={{ width: 48, height: 48, borderRadius: radii.pill, backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center' }}>
            <Play color={theme.ink} fill={theme.ink} size={20} />
          </View>
          <View style={{ flex: 1 }}>
            <T variant="label" color={theme.bg} style={{ opacity: 0.8 }}>
              Vidéo du cours{v.duree ? ` · ${v.duree}` : ''}
            </T>
            <T variant="rowTitle" color={theme.bg}>
              {v.titre}
            </T>
          </View>
        </Tap>
      ))}

      <T variant="label" color={theme.ink3} style={{ marginTop: 6, marginBottom: 8 }}>
        Objectifs
      </T>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
        {lesson.objectifs.map((o) => (
          <View key={o} style={{ backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.line, borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 6 }}>
            <T variant="caption" color={theme.ink2}>
              {o}
            </T>
          </View>
        ))}
      </View>

      <View style={{ gap: 8 }}>
        {SECTIONS.map((section, i) => {
          const isDone = done.includes(section);
          const isNext = section === nextStep;
          const empty = section === 'dialogue' && lesson.dialogue.length === 0;
          return (
            <Tap
              key={section}
              label={`${STEP[section].label}${isDone ? ', terminé' : ''}`}
              onPress={() => router.push(`/lecon/${lesson.id}/${section}`)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                minHeight: 64,
                backgroundColor: theme.surface,
                borderRadius: radii.card,
                borderWidth: isNext ? 2 : 1,
                borderColor: isNext ? theme.accent : theme.line,
                paddingHorizontal: isNext ? 13 : 14,
                paddingVertical: 10,
              }}>
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: radii.chip,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isDone ? theme.goodSoft : isNext ? theme.accent : theme.muted,
                }}>
                {isDone ? (
                  <Check color={theme.good} size={20} strokeWidth={2.6} />
                ) : (
                  <T variant="bodyStrong" color={isNext ? theme.onAccent : theme.ink3}>
                    {i + 1}
                  </T>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <T variant="rowTitle">{STEP[section].label}</T>
                <T variant="caption" color={theme.ink3}>
                  {STEP[section].detail(lesson)}
                  {isDone && !empty ? ' · fini' : ''}
                </T>
              </View>
              <ChevronRight color={isNext ? theme.accent : theme.ink3} size={20} strokeWidth={2.2} />
            </Tap>
          );
        })}
      </View>
    </Screen>
  );
}
