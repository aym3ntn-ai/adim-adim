import lessonsFile from './lecons.json';
import popupsFile from './popups.json';
import type { Lesson, Popup } from './types';

export const lessons = lessonsFile.lecons as Lesson[];
export const popups = popupsFile.popups as Popup[];

export function lessonById(id: string): Lesson | undefined {
  return lessons.find((l) => l.id === id);
}

/** Stable key of one vocabulary card, used by the review progress. */
export function cardKey(lessonId: string, index: number): string {
  return `${lessonId}:${index}`;
}
