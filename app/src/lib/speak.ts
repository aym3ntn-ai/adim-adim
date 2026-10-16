import * as Speech from 'expo-speech';

/** Reads Turkish text aloud with the phone's voice; queued after anything already playing. */
export function speak(text: string, opts: { interrupt?: boolean } = {}): void {
  if (opts.interrupt !== false) Speech.stop();
  Speech.speak(text, { language: 'tr-TR', rate: 0.9 });
}

export function speakAll(lines: string[]): void {
  Speech.stop();
  for (const line of lines) Speech.speak(line, { language: 'tr-TR', rate: 0.9 });
}

export function stopSpeaking(): void {
  Speech.stop();
}
