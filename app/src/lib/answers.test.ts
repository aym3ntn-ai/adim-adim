import assert from 'node:assert/strict';
import { test } from 'node:test';
import { check, normalize, plain } from './answers.ts';

test('normalize applies Turkish casing', () => {
  assert.equal(normalize('İSTANBUL'), 'istanbul');
  assert.equal(normalize('ILIK'), 'ılık');
  assert.equal(normalize('  Nasılsınız ? '), 'nasılsınız');
});

test('plain drops the Turkish letters', () => {
  assert.equal(plain('Günaydın'), 'gunaydin');
  assert.equal(plain('Şeker'), 'seker');
});

test('exact answers are correct, whatever the case and punctuation', () => {
  assert.equal(check('ben doktor değilim', 'Ben doktor değilim.'), 'correct');
  assert.equal(check('Rica', 'Rica'), 'correct');
});

test('the missing last word alone is accepted', () => {
  assert.equal(check('mühendisim', 'Ben mühendisim.'), 'correct');
  assert.equal(check('m', 'Ben mühendisim.'), 'wrong');
});

test('answers without the Turkish letters are almost right', () => {
  assert.equal(check('Nasilsiniz', 'Nasılsınız?'), 'almost');
  assert.equal(check('defterler', 'defterler'), 'correct');
});

test('wrong answers stay wrong', () => {
  assert.equal(check('evler', 'kitaplar'), 'wrong');
  assert.equal(check('', 'kitaplar'), 'wrong');
});
