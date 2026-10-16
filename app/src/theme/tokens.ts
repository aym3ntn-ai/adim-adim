// "İznik": warm paper, deep blue for actions, brick orange for reminders.
// Light values come from the design canvas; the dark palette mirrors them.

export interface Palette {
  bg: string;
  surface: string;
  line: string;
  rowLine: string;
  ink: string;
  ink2: string;
  ink3: string;
  accent: string;
  /** Text and icons placed on an `accent` fill. */
  onAccent: string;
  accentSoft: string;
  warm: string;
  warmInk: string;
  warmSoft: string;
  good: string;
  goodSoft: string;
  peach: string;
  peachInk: string;
  muted: string;
}

export const light: Palette = {
  bg: '#F6F3EE',
  surface: '#FFFFFF',
  line: '#E4DED4',
  rowLine: '#EEE9E1',
  ink: '#1B1F2A',
  ink2: '#3A3F4B',
  ink3: '#5B6170',
  accent: '#1F4E8C',
  onAccent: '#FFFFFF',
  accentSoft: '#EAF0F8',
  warm: '#C8572B',
  warmInk: '#A8441C',
  warmSoft: '#FBEDE4',
  good: '#24613A',
  goodSoft: '#E3EFE6',
  peach: '#F2B38F',
  peachInk: '#5A2410',
  muted: '#EEE9E1',
};

export const dark: Palette = {
  bg: '#12151B',
  surface: '#1B2029',
  line: '#2B313C',
  rowLine: '#232933',
  ink: '#F2EFEA',
  ink2: '#C9CDD6',
  ink3: '#9AA1AE',
  accent: '#8DB2E8',
  onAccent: '#0F1A2B',
  accentSoft: '#1D2A3D',
  warm: '#E58A60',
  warmInk: '#F0A27F',
  warmSoft: '#3A2419',
  good: '#6CC08A',
  goodSoft: '#1B3324',
  peach: '#F2B38F',
  peachInk: '#5A2410',
  muted: '#232933',
};

export const radii = { hero: 24, card: 18, tile: 14, chip: 10, pill: 999 };
export const space = { screen: 20, gap: 14, section: 22 };
export const TOUCH = 44;

export const fonts = {
  display: 'BricolageGrotesque_700Bold',
  regular: 'Figtree_400Regular',
  medium: 'Figtree_500Medium',
  semibold: 'Figtree_600SemiBold',
  bold: 'Figtree_700Bold',
};

export const type = {
  screenTitle: { fontFamily: fonts.display, fontSize: 30, lineHeight: 34, letterSpacing: -0.5 },
  hero: { fontFamily: fonts.display, fontSize: 26, lineHeight: 30, letterSpacing: -0.3 },
  word: { fontFamily: fonts.display, fontSize: 38, lineHeight: 44, letterSpacing: -0.5 },
  cardTitle: { fontFamily: fonts.display, fontSize: 20, lineHeight: 24 },
  rowTitle: { fontFamily: fonts.semibold, fontSize: 15.5, lineHeight: 20 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 22 },
  caption: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18 },
  label: { fontFamily: fonts.bold, fontSize: 12, lineHeight: 16, letterSpacing: 0.7, textTransform: 'uppercase' },
} as const;

export type TypeVariant = keyof typeof type;
