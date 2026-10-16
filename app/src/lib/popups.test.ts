import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Popup } from '../content/types.ts';
import { buildConfig, inQuietHours, selectPopups, type PopupPrefs } from './popups.ts';

const all: Popup[] = [
  { id: 'a', type: 'nouveau_mot', lecon: 'L02', titre: 'Günaydın', texte: 'Bonjour', audio: null },
  { id: 'b', type: 'regle', lecon: 'L03', titre: 'değil', texte: 'Négation', audio: null },
  { id: 'c', type: 'beau_mot', lecon: null, titre: 'huzur', texte: 'Sérénité', audio: null },
  { id: 'd', type: 'rappel', lecon: 'L01', titre: 'ı ≠ i', texte: 'Rappel', audio: null },
];

const prefs: PopupPrefs = {
  enabled: true,
  intervalMinutes: 120,
  types: { nouveau_mot: true, regle: true, rappel: true, beau_mot: true },
  onlySeen: true,
  quiet: [22, 8],
};

test('only lessons already opened, plus general pop-ups', () => {
  const ids = selectPopups(all, prefs, new Set(['L02'])).map((p) => p.id);
  assert.deepEqual(ids, ['a', 'c']);
});

test('every lesson when onlySeen is off', () => {
  assert.equal(selectPopups(all, { ...prefs, onlySeen: false }, new Set()).length, 4);
});

test('disabled types are left out', () => {
  const ids = selectPopups(all, { ...prefs, onlySeen: false, types: { ...prefs.types, beau_mot: false } }, new Set()).map((p) => p.id);
  assert.deepEqual(ids, ['a', 'b', 'd']);
});

test('the native config carries labels, quiet hours and a floor on the interval', () => {
  const config = buildConfig(all, { ...prefs, intervalMinutes: 5 }, new Set(['L03']));
  assert.equal(config.intervalMinutes, 15);
  assert.equal(config.quietStart, 22);
  assert.equal(config.quietEnd, 8);
  assert.equal(config.durationMs, 5000);
  assert.deepEqual(config.items.map((i) => i.tag), ['Règle', 'Beau mot']);
});

test('nothing to show turns the schedule off', () => {
  const config = buildConfig(all, { ...prefs, types: { nouveau_mot: false, regle: false, rappel: false, beau_mot: false } }, new Set());
  assert.equal(config.enabled, false);
});

test('quiet hours across midnight', () => {
  assert.equal(inQuietHours(23, [22, 8]), true);
  assert.equal(inQuietHours(7, [22, 8]), true);
  assert.equal(inQuietHours(8, [22, 8]), false);
  assert.equal(inQuietHours(14, [13, 15]), true);
  assert.equal(inQuietHours(14, null), false);
});
