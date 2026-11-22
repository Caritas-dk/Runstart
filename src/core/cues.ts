import type { Snapshot } from './engine';
import type { VoiceAmount } from './types';

export type Cue =
  | { kind: 'segment'; idx: number }
  | { kind: 'half' }
  | { kind: 'next'; idx: number }
  | { kind: 'countdown'; n: number }
  | { kind: 'done' };

export interface CueOptions { voiceAmount: VoiceAmount; countdown: number }

/**
 * Compares two consecutive snapshots and returns what the guide should say
 * or play. If the app was suspended for a long time, only the current
 * interval is announced (no backlog of stale cues).
 */
export function cuesBetween(prev: Snapshot, next: Snapshot, o: CueOptions, nextSegDur?: number): Cue[] {
  const cues: Cue[] = [];
  if (next.done && !prev.done) return [{ kind: 'done' }];
  if (next.done) return cues;
  if (next.idx !== prev.idx) {
    cues.push({ kind: 'segment', idx: next.idx });
    return cues;
  }
  if (next.paused) return cues;
  const jump = next.active - prev.active;
  if (jump <= 0 || jump > 3) return cues; // nothing new or caught up after suspension
  const d = next.seg.dur;
  const pr = prev.segRemaining, nr = next.segRemaining;
  if (o.voiceAmount === 'full') {
    if (d >= 240 && prev.segEl < d / 2 && next.segEl >= d / 2 && nr > 15) cues.push({ kind: 'half' });
    const th = Math.min(15, d / 3);
    if (nextSegDur !== undefined && pr > th && nr <= th && nr > o.countdown + 1) cues.push({ kind: 'next', idx: next.idx + 1 });
  }
  if (o.countdown > 0 && nextSegDur !== undefined) {
    const pc = Math.ceil(pr - 1e-9), nc = Math.ceil(nr - 1e-9);
    if (nc !== pc && nc >= 1 && nc <= o.countdown) cues.push({ kind: 'countdown', n: nc });
  }
  return cues;
}
