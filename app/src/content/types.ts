// Shapes of the bundled course content (lecons.json, popups.json).

export interface Pair {
  tr: string;
  fr: string;
}

export interface GrammarPoint {
  titre: string;
  explication: string;
  exemples: Pair[];
}

export interface DialogueLine {
  locuteur: string;
  tr: string;
  fr: string;
}

export type Exercise =
  | { type: 'qcm'; consigne: string; options: string[]; reponse: string }
  | { type: 'completer' | 'traduction'; consigne: string; reponse: string }
  | { type: 'association'; consigne: string; paires: Pair[] };

export interface Video {
  titre: string;
  url: string;
  duree?: string;
}

export interface Lesson {
  id: string;
  numero: number;
  titre: string;
  titre_tr: string;
  objectifs: string[];
  vocabulaire: Pair[];
  grammaire: GrammarPoint[];
  dialogue: DialogueLine[];
  exercices: Exercise[];
  videos: Video[];
}

export type PopupType = 'nouveau_mot' | 'regle' | 'rappel' | 'beau_mot';

export interface Popup {
  id: string;
  type: PopupType;
  /** Lesson the pop-up belongs to; null when it fits any time. */
  lecon: string | null;
  titre: string;
  texte: string;
  audio: string | null;
}

export type Section = 'vocabulaire' | 'grammaire' | 'dialogue' | 'exercices';
export const SECTIONS: Section[] = ['vocabulaire', 'grammaire', 'dialogue', 'exercices'];
