import { router } from 'expo-router';
import { ArrowRight, Check, Flame } from 'lucide-react-native';
import { View } from 'react-native';
import { ProgressBar } from '@/components/ProgressBar';
import { Screen } from '@/components/Screen';
import { T } from '@/components/T';
import { Tap } from '@/components/Tap';
import { lessons } from '@/content';
import { SECTIONS, type Section } from '@/content/types';
import { isFinished, liveStreak, useProgress } from '@/store/progress';
import { radii } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

const SECTION_LABEL: Record<Section, string> = {
  vocabulaire: 'Vocabulaire',
  grammaire: 'Grammaire',
  dialogue: 'Dialogue',
  exercices: 'Exercices',
};

function greeting(): string {
  const h = new Date().getHours();
  if (h < 11) return 'Günaydın !';
  if (h < 18) return 'İyi günler !';
  return 'İyi akşamlar !';
}

export default function Home() {
  const theme = useTheme();
  const { lessons: progress, cards, streak, lastDay } = useProgress();

  const finished = lessons.filter((l) => isFinished(progress[l.id])).length;
  const known = Object.values(cards).filter((c) => c === 'known').length;
  const toReview = Object.values(cards).filter((c) => c === 'review').length;
  const days = liveStreak(streak, lastDay);

  // The lesson in progress, else the first one not finished yet.
  const current =
    lessons.find((l) => progress[l.id] && !isFinished(progress[l.id])) ??
    lessons.find((l) => !isFinished(progress[l.id])) ??
    lessons[lessons.length - 1]!;
  const currentDone = progress[current.id]?.done ?? [];
  const nextSection = SECTIONS.find((s) => !currentDone.includes(s));

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <View style={{ flex: 1 }}>
          <T variant="body" color={theme.ink3}>
            {greeting()}
          </T>
          <T variant="screenTitle" accessibilityRole="header">
            Turc A1.1
          </T>
        </View>
        <View
          accessibilityLabel={`Série : ${days} jour${days > 1 ? 's' : ''}`}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.line, borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 8 }}>
          <Flame color={theme.warm} size={18} strokeWidth={2} />
          <T variant="bodyStrong" color={theme.warmInk}>
            {days} jour{days > 1 ? 's' : ''}
          </T>
        </View>
      </View>

      <Tap
        label={`Continuer : leçon ${current.numero}, ${current.titre}`}
        onPress={() => router.push(`/lecon/${current.id}`)}
        style={{ backgroundColor: theme.accent, borderRadius: radii.hero, padding: 20, gap: 14 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <T variant="label" color={theme.onAccent} style={{ opacity: 0.85 }}>
            {currentDone.length ? 'Continuer' : 'Commencer'} · Leçon {current.numero}
          </T>
          <T variant="caption" color={theme.onAccent} style={{ opacity: 0.85 }}>
            {Math.round((currentDone.length / SECTIONS.length) * 100)} %
          </T>
        </View>
        <View>
          <T variant="hero" color={theme.onAccent}>
            {current.titre}
          </T>
          <T variant="body" color={theme.onAccent} style={{ fontStyle: 'italic', opacity: 0.9 }}>
            {current.titre_tr}
          </T>
        </View>
        <ProgressBar value={currentDone.length / SECTIONS.length} color={theme.peach} track="rgba(255,255,255,0.25)" height={6} />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <T variant="body" color={theme.onAccent} style={{ opacity: 0.9 }}>
            {nextSection ? `Prochaine étape : ${SECTION_LABEL[nextSection]}` : 'Leçon terminée, bravo !'}
          </T>
          <View style={{ width: 44, height: 44, borderRadius: radii.pill, backgroundColor: theme.onAccent, alignItems: 'center', justifyContent: 'center' }}>
            <ArrowRight color={theme.accent} size={20} strokeWidth={2.4} />
          </View>
        </View>
      </Tap>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
        <Stat value={`${finished}/${lessons.length}`} label="leçons finies" />
        <Stat value={String(known)} label="mots appris" />
        <Stat value={String(toReview)} label="à réviser" />
      </View>

      <T variant="cardTitle" accessibilityRole="header" style={{ marginTop: 24, marginBottom: 10 }}>
        Leçons A1.1
      </T>
      <View style={{ gap: 8 }}>
        {lessons.map((l) => {
          const p = progress[l.id];
          const done = isFinished(p);
          const started = !!p && !done;
          const badge = done
            ? { bg: theme.goodSoft, fg: theme.good }
            : started
              ? { bg: theme.peach, fg: theme.peachInk }
              : { bg: theme.muted, fg: theme.ink3 };
          return (
            <Tap
              key={l.id}
              label={`Leçon ${l.numero} : ${l.titre}${done ? ', terminée' : started ? ', en cours' : ''}`}
              onPress={() => router.push(`/lecon/${l.id}`)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.line, borderRadius: radii.card, paddingHorizontal: 12, paddingVertical: 10, minHeight: 60 }}>
              <View style={{ width: 40, height: 40, borderRadius: radii.tile, backgroundColor: badge.bg, alignItems: 'center', justifyContent: 'center' }}>
                {done ? (
                  <Check color={badge.fg} size={20} strokeWidth={2.6} />
                ) : (
                  <T variant="bodyStrong" color={badge.fg}>
                    {l.numero}
                  </T>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <T variant="rowTitle">{l.titre}</T>
                <T variant="caption" color={theme.ink3} style={{ fontStyle: 'italic' }}>
                  {l.titre_tr}
                </T>
              </View>
              {started ? (
                <T variant="caption" color={theme.ink3} style={{ fontWeight: '600' }}>
                  En cours
                </T>
              ) : null}
            </Tap>
          );
        })}
      </View>
    </Screen>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.line, borderRadius: radii.card, padding: 12 }}>
      <T variant="cardTitle">{value}</T>
      <T variant="caption" color={theme.ink3}>
        {label}
      </T>
    </View>
  );
}
