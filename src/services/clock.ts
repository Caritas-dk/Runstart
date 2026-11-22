import { Platform } from 'react-native';

/**
 * Workout clock. On phones it is plain wall-clock time. In the browser demo
 * it can be sped up (1×/10×/60×) or skip ahead, so a 25-minute session can be
 * tried in a minute. The workout engine only ever reads time from here.
 */
export const DEMO = Platform.OS === 'web';

let speed = 1;
let realBase = Date.now();
let virt = realBase;

export function now(): number {
  if (!DEMO) return Date.now();
  const r = Date.now();
  virt += (r - realBase) * speed;
  realBase = r;
  return virt;
}

export function getSpeed() { return speed; }

export function setSpeed(s: number) {
  now();
  speed = s;
}

export function skip(sec: number) {
  now();
  virt += sec * 1000;
}
