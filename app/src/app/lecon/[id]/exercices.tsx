import { router, useLocalSearchParams } from 'expo-router';
import { Check, X } from 'lucide-react-native';
import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { Button } from '@/components/Button';
import { Header } from '@/components/Header';
import { ProgressBar } from '@/components/ProgressBar';
import { Screen } from '@/components/Screen';
import { T } from '@/components/T';
import { Tap } from '@/components/Tap';
import { lessonById, lessons } from '@/content';
import type { Exercise } from '@/content/types';
import { check, type Verdict } from '@/lib/answers';
import { useProgress } from '@/store/progress';
import { fonts, radii } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

function answerOf(ex: Exercise): string {
  return ex.type === 'association' ? '' : ex.reponse;
}

export default function Exercises() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = lessonById(id);
  const complete = useProgress((s) => s.complete);
  const setScore = useProgress((s) => s.setScore);

  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<string | null>(null);
  const [typed, setTyped] = useState('');
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [revealedPairs, setRevealedPairs] = useState<number[]>([]);
  const [right, setRight] = useState(0);
  const [finished, setFinished] = useState(false);

  if (!lesson) return null;
  const total = lesson.exercices.length;
  const ex = lesson.exercices[index];

  const reset = () => {
    setChoice(null);
    setTyped('');
    setVerdict(null);
    setRevealedPairs([]);
  };

  const submit = (v: Verdict) => {
    setVerdict(v);
    if (v !== 'wrong') setRight((r) => r + 1);
  };

  const next = () => {
    if (index + 1 < total) {
      setIndex(index + 1);
      reset();
      return;
    }
    complete(lesson.id, 'exercices');
    setScore(lesson.id, right, total);
    setFinished(true);
  };

  if (finished || !ex) {
    const nextLesson = lessons.find((l) => l.numero === lesson.numero + 1);
    return (
      <Screen
        footer={
          <View style={{ gap: 10 }}>
            {nextLesson ? (
              <Button label={`Leçon ${nextLesson.numero} : ${nextLesson.titre}`} onPress={() => router.replace(`/lecon/${nextLesson.id}`)} />
            ) : null}
            <Button
              label="Recommencer les exercices"
              variant="outline"
              onPress={() => {
                setIndex(0);
                setRight(0);
                setFinished(false);
                reset();
              }}
            />
          </View>
        }>
        <Header kind="close" label={`Leçon ${lesson.numero} · Exercices`} />
        <View style={{ backgroundColor: theme.goodSoft, borderRadius: radii.hero, padding: 22, gap: 6 }}>
          <T variant="screenTitle" color={theme.good}>
            {right}/{total}
          </T>
          <T variant="cardTitle" color={theme.good}>
            {right === total ? 'Mükemmel ! Tout est juste.' : right >= total / 2 ? 'Aferin ! Bon travail.' : 'Devam ! Revoyez la leçon et réessayez.'}
          </T>
          <T variant="body" color={theme.good}>
            Leçon {lesson.numero} terminée. Ses mots et règles peuvent maintenant apparaître dans vos pop-ups de révision.
          </T>
        </View>
      </Screen>
    );
  }

  const answered = verdict !== null;

  const feedback = verdict ? (
    <View style={{ gap: 6, backgroundColor: verdict === 'wrong' ? theme.warmSoft : theme.goodSoft, borderRadius: radii.hero - 4, padding: 16 }}>
      <T variant="cardTitle" color={verdict === 'wrong' ? theme.warmInk : theme.good}>
        {verdict === 'correct' ? 'Aferin ! Bonne réponse.' : verdict === 'almost' ? 'Presque ! Attention aux lettres turques.' : 'Pas tout à fait.'}
      </T>
      {verdict !== 'correct' ? (
        <T variant="body" color={verdict === 'wrong' ? theme.warmInk : theme.good}>
          Réponse : <T variant="bodyStrong" color={verdict === 'wrong' ? theme.warmInk : theme.good}>{answerOf(ex)}</T>
        </T>
      ) : null}
    </View>
  ) : null;

  let footer;
  if (answered) {
    footer = (
      <View style={{ gap: 12 }}>
        {feedback}
        <Button label={index + 1 < total ? 'Continuer' : 'Voir mon score'} variant={verdict === 'wrong' ? 'primary' : 'good'} onPress={next} />
      </View>
    );
  } else if (ex.type === 'completer' || ex.type === 'traduction') {
    footer = <Button label="Vérifier" disabled={!typed.trim()} onPress={() => submit(check(typed, ex.reponse))} />;
  }

  return (
    <Screen footer={footer}>
      <Header kind="close">
        <ProgressBar value={(index + (answered ? 1 : 0)) / total} color={theme.accent} track={theme.line} />
        <T variant="bodyStrong" color={theme.ink3}>
          {index + 1}/{total}
        </T>
      </Header>

      <T variant="label" color={theme.ink3} style={{ marginBottom: 8 }}>
        {ex.type === 'qcm' ? 'Choisissez la bonne réponse' : ex.type === 'association' ? 'Associez' : ex.type === 'traduction' ? 'Traduisez' : 'Complétez'}
      </T>
      <T variant="hero" accessibilityRole="header" style={{ marginBottom: 20 }}>
        {ex.consigne}
      </T>

      {ex.type === 'qcm' ? (
        <View accessibilityRole="radiogroup" style={{ gap: 10 }}>
          {ex.options.map((option, i) => {
            const isAnswer = option === ex.reponse;
            const picked = option === choice;
            const showGood = verdict !== null && isAnswer;
            const showBad = verdict === 'wrong' && picked;
            return (
              <Tap
                key={option}
                accessibilityRole="radio"
                accessibilityState={{ checked: picked, disabled: verdict !== null }}
                disabled={verdict !== null}
                dimWhenDisabled={false}
                onPress={() => {
                  setChoice(option);
                  submit(isAnswer ? 'correct' : 'wrong');
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  minHeight: 56,
                  borderRadius: radii.card,
                  paddingHorizontal: showGood || showBad ? 15 : 16,
                  borderWidth: showGood || showBad ? 2 : 1,
                  borderColor: showGood ? theme.good : showBad ? theme.warm : theme.line,
                  backgroundColor: showGood ? theme.goodSoft : showBad ? theme.warmSoft : theme.surface,
                }}>
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: radii.chip - 2,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: showGood ? theme.good : showBad ? theme.warm : theme.muted,
                  }}>
                  {showGood ? (
                    <Check color={theme.surface} size={16} strokeWidth={3} />
                  ) : showBad ? (
                    <X color={theme.surface} size={16} strokeWidth={3} />
                  ) : (
                    <T variant="caption" color={theme.ink3} style={{ fontFamily: fonts.bold }}>
                      {LETTERS[i]}
                    </T>
                  )}
                </View>
                <T variant="bodyStrong" style={{ flex: 1, fontSize: 17 }}>
                  {option}
                </T>
              </Tap>
            );
          })}
        </View>
      ) : null}

      {ex.type === 'completer' || ex.type === 'traduction' ? (
        <View style={{ gap: 8 }}>
          <TextInput
            value={typed}
            onChangeText={setTyped}
            editable={verdict === null}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Votre réponse en turc"
            placeholderTextColor={theme.ink3}
            accessibilityLabel="Votre réponse"
            onSubmitEditing={() => typed.trim() && verdict === null && submit(check(typed, ex.reponse))}
            style={{ minHeight: 56, borderRadius: radii.card, borderWidth: 1, borderColor: theme.line, backgroundColor: theme.surface, paddingHorizontal: 16, color: theme.ink, fontFamily: fonts.semibold, fontSize: 18 }}
          />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {['ç', 'ğ', 'ı', 'İ', 'ö', 'ş', 'ü'].map((letter) => (
              <Tap
                key={letter}
                label={`Insérer ${letter}`}
                disabled={verdict !== null}
                onPress={() => setTyped((t) => t + letter)}
                style={{ minWidth: 44, minHeight: 44, borderRadius: radii.chip, borderWidth: 1, borderColor: theme.line, backgroundColor: theme.surface, alignItems: 'center', justifyContent: 'center' }}>
                <T variant="bodyStrong" style={{ fontSize: 17 }}>
                  {letter}
                </T>
              </Tap>
            ))}
          </View>
        </View>
      ) : null}

      {ex.type === 'association' ? (
        <View style={{ gap: 10 }}>
          <T variant="caption" color={theme.ink3}>
            Dites la réponse dans votre tête, puis touchez pour vérifier.
          </T>
          {ex.paires.map((pair, i) => {
            const shown = revealedPairs.includes(i);
            return (
              <Tap
                key={pair.tr}
                label={shown ? `${pair.tr} : ${pair.fr}` : `Révéler ${pair.tr}`}
                onPress={() => {
                  if (shown) return;
                  const next = [...revealedPairs, i];
                  setRevealedPairs(next);
                  if (next.length === ex.paires.length) submit('correct');
                }}
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, minHeight: 56, borderRadius: radii.card, borderWidth: 1, borderColor: shown ? theme.good : theme.line, backgroundColor: shown ? theme.goodSoft : theme.surface, paddingHorizontal: 16 }}>
                <T variant="bodyStrong" style={{ fontSize: 17 }}>
                  {pair.tr}
                </T>
                <T variant="body" color={shown ? theme.good : theme.ink3}>
                  {shown ? pair.fr : 'Toucher'}
                </T>
              </Tap>
            );
          })}
        </View>
      ) : null}
    </Screen>
  );
}
