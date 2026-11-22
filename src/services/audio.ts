import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as Speech from 'expo-speech';
import { Platform, Vibration } from 'react-native';
import type { Lang } from '../core/types';

/**
 * Voice guide, tones and keeping the workout alive in the background.
 *
 * - The app's audio session always mixes with other apps, so Spotify or
 *   another music app keeps playing.
 * - While the voice speaks, other audio is ducked (lowered):
 *   iOS: the speech runs in its own system-managed session that ducks others.
 *   Android: we switch the audio focus to "may duck" while speaking.
 * - A silent looping track keeps the app running with the screen locked
 *   (iOS background audio; Android media foreground service with a
 *   notification showing the current interval).
 */

type ToneKind = 'count' | 'run' | 'walk' | 'done';
const SOURCES: Record<ToneKind | 'silence', number> = {
  silence: require('../../assets/sounds/silence.wav'),
  count: require('../../assets/sounds/count.wav'),
  run: require('../../assets/sounds/run.wav'),
  walk: require('../../assets/sounds/walk.wav'),
  done: require('../../assets/sounds/done.wav'),
};

const BASE_MODE = {
  playsInSilentMode: true,
  shouldPlayInBackground: true,
  interruptionMode: 'mixWithOthers' as const,
  allowsRecording: false,
};

let keepAlive: AudioPlayer | null = null;
const tones: Partial<Record<ToneKind, AudioPlayer>> = {};
let sessionActive = false;
let speaking = 0;
let duckRelease: ReturnType<typeof setTimeout> | null = null;

async function ensurePlayers() {
  try { await setAudioModeAsync(BASE_MODE); } catch {}
  for (const k of ['count', 'run', 'walk', 'done'] as ToneKind[]) {
    if (!tones[k]) { try { tones[k] = createAudioPlayer(SOURCES[k]); } catch {} }
  }
}

export async function prepareAudio() { await ensurePlayers(); }

export async function startSession(title: string, artist: string) {
  await ensurePlayers();
  try {
    if (!keepAlive) keepAlive = createAudioPlayer(SOURCES.silence, { keepAudioSessionActive: true });
    keepAlive.loop = true;
    keepAlive.volume = 1;
    keepAlive.play();
    if (Platform.OS === 'android') keepAlive.setActiveForLockScreen(true, { title, artist });
  } catch {}
  sessionActive = true;
}

let lastTitle = '';
export function updateSessionStatus(title: string, artist: string) {
  if (!sessionActive || Platform.OS !== 'android' || title === lastTitle) return;
  lastTitle = title;
  try { keepAlive?.updateLockScreenMetadata({ title, artist }); } catch {}
}

export async function endSession() {
  sessionActive = false;
  lastTitle = '';
  try { keepAlive?.pause(); keepAlive?.clearLockScreenControls(); } catch {}
  try { await setAudioModeAsync(BASE_MODE); } catch {}
}

export function tone(kind: ToneKind, volume: number) {
  const p = tones[kind];
  if (!p) return;
  try { p.volume = Math.max(0, Math.min(1, volume)); p.seekTo(0); p.play(); } catch {}
}

async function duck(on: boolean) {
  if (Platform.OS !== 'android') return;
  try { await setAudioModeAsync({ ...BASE_MODE, interruptionMode: on ? 'duckOthers' : 'mixWithOthers' }); } catch {}
}

const LANGS: Record<Lang, string> = { da: 'da-DK', en: 'en-GB', fr: 'fr-FR', de: 'de-DE', es: 'es-ES' };

export function speak(text: string, lang: Lang, volume: number) {
  if (!text) return;
  speaking++;
  if (duckRelease) { clearTimeout(duckRelease); duckRelease = null; }
  void duck(true);
  const finish = () => {
    speaking = Math.max(0, speaking - 1);
    if (speaking === 0) {
      // small delay so back-to-back phrases do not pump the music volume
      duckRelease = setTimeout(() => { if (speaking === 0) void duck(false); }, 600);
    }
  };
  try {
    Speech.speak(text, {
      language: LANGS[lang],
      volume: Math.max(0, Math.min(1, volume)),
      rate: Platform.OS === 'ios' ? 0.52 : 1.0,
      useApplicationAudioSession: false,
      onDone: finish,
      onStopped: finish,
      onError: finish,
    });
  } catch { finish(); }
}

export function stopSpeech() {
  try { Speech.stop(); } catch {}
}

export function vibrate(enabled: boolean, pattern: number | number[]) {
  if (!enabled) return;
  try { Vibration.vibrate(pattern as number[]); } catch {}
}
