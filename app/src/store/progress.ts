import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SECTIONS, type Section } from '@/content/types';
import { storage } from './storage';

export interface LessonProgress {
  done: Section[];
  /** Best exercise result. */
  score?: { right: number; total: number };
}

export type CardState = 'known' | 'review';

interface ProgressState {
  /** Lessons opened at least once, with what was finished in each. */
  lessons: Record<string, LessonProgress>;
  cards: Record<string, CardState>;
  streak: number;
  /** Local day (YYYY-MM-DD) of the last study session. */
  lastDay: string | null;
  open: (lessonId: string) => void;
  complete: (lessonId: string, section: Section) => void;
  setScore: (lessonId: string, right: number, total: number) => void;
  grade: (key: string, state: CardState) => void;
  reset: () => void;
}

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);
}

/** Streak update for a study action happening today. */
function studied(s: Pick<ProgressState, 'streak' | 'lastDay'>): Pick<ProgressState, 'streak' | 'lastDay'> {
  const day = today();
  if (s.lastDay === day) return s;
  const gap = s.lastDay ? daysBetween(s.lastDay, day) : Infinity;
  return { streak: gap === 1 ? s.streak + 1 : 1, lastDay: day };
}

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      lessons: {},
      cards: {},
      streak: 0,
      lastDay: null,
      open: (id) =>
        set((s) => (s.lessons[id] ? {} : { lessons: { ...s.lessons, [id]: { done: [] } } })),
      complete: (id, section) =>
        set((s) => {
          const current = s.lessons[id] ?? { done: [] };
          const done = current.done.includes(section) ? current.done : [...current.done, section];
          return { ...studied(s), lessons: { ...s.lessons, [id]: { ...current, done } } };
        }),
      setScore: (id, right, total) =>
        set((s) => {
          const current = s.lessons[id] ?? { done: [] };
          const best = current.score && current.score.right / current.score.total >= right / total ? current.score : { right, total };
          return { lessons: { ...s.lessons, [id]: { ...current, score: best } } };
        }),
      grade: (key, state) => set((s) => ({ ...studied(s), cards: { ...s.cards, [key]: state } })),
      reset: () => set({ lessons: {}, cards: {}, streak: 0, lastDay: null }),
    }),
    { name: 'adimadim.progress', storage },
  ),
);

export function isFinished(p: LessonProgress | undefined): boolean {
  return !!p && SECTIONS.every((s) => p.done.includes(s));
}

/** Current streak, or 0 once a whole day has been missed. */
export function liveStreak(streak: number, lastDay: string | null): number {
  if (!lastDay) return 0;
  return daysBetween(lastDay, today()) <= 1 ? streak : 0;
}
