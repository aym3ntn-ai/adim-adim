// Checking typed answers. Turkish casing needs care (I/ı, İ/i), and beginners
// often type without the Turkish letters, which earns a "presque" instead of a miss.

export type Verdict = 'correct' | 'almost' | 'wrong';

const TURKISH_PLAIN: Record<string, string> = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a', î: 'i', û: 'u' };

/** Lowercases with Turkish rules, drops punctuation and extra spaces. */
export function normalize(text: string): string {
  return text
    .replace(/I/g, 'ı')
    .replace(/İ/g, 'i')
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[.,!?;:«»"“”()…]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Same as normalize, with the Turkish letters reduced to plain Latin ones. */
export function plain(text: string): string {
  return normalize(text).replace(/[çğıöşüâîû]/g, (c) => TURKISH_PLAIN[c] ?? c);
}

function matches(input: string, answer: string): boolean {
  if (!input) return false;
  if (input === answer) return true;
  // "mühendisim" for "Ben mühendisim." — the missing word was the one asked for.
  return answer.endsWith(` ${input}`) && input.length >= 2;
}

export function check(input: string, answer: string): Verdict {
  if (matches(normalize(input), normalize(answer))) return 'correct';
  if (matches(plain(input), plain(answer))) return 'almost';
  return 'wrong';
}
