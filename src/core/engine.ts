import type { Segment } from './types';

/**
 * Workout timing is derived from wall-clock timestamps, never from counting
 * ticks. If the phone suspends the app for a while (locked screen, OS
 * throttling) the next snapshot is still exact.
 *
 * - Total time includes all running, walking and pauses.
 * - Pauses freeze the current interval but keep counting in total time.
 */
export interface EngineState {
  segments: Segment[];
  startMs: number;
  pauses: { start: number; end: number | null }[];
  /** planned seconds (without extra walk breaks) */
  planned: number;
}

export interface Snapshot {
  idx: number;
  seg: Segment;
  segEl: number;
  segRemaining: number;
  active: number;
  total: number;
  pause: number;
  paused: boolean;
  run: number;
  walk: number;
  longest: number;
  /** remaining seconds of the (current) plan incl. inserted extra walks */
  remaining: number;
  /** planned (non-extra) seconds completed */
  plannedDone: number;
  done: boolean;
}

export function createEngine(segments: Segment[], startMs: number): EngineState {
  const segs = segments.map((s) => ({ ...s }));
  return { segments: segs, startMs, pauses: [], planned: segs.reduce((a, b) => a + b.dur, 0) };
}

export const isPaused = (e: EngineState) => e.pauses.length > 0 && e.pauses[e.pauses.length - 1].end === null;

function pausedMs(e: EngineState, now: number) {
  return e.pauses.reduce((a, p) => a + ((p.end ?? now) - p.start), 0);
}

export function snapshot(e: EngineState, now: number): Snapshot {
  const totalSec = Math.max(0, (now - e.startMs) / 1000);
  const pauseSec = pausedMs(e, now) / 1000;
  const sum = e.segments.reduce((a, b) => a + b.dur, 0);
  const activeRaw = Math.max(0, totalSec - pauseSec);
  const active = Math.min(activeRaw, sum);
  const done = activeRaw >= sum - 1e-9;

  let acc = 0, idx = e.segments.length - 1, segEl = e.segments[idx].dur;
  let run = 0, walk = 0, longest = 0, curRun = 0, plannedDone = 0, found = false;
  for (let i = 0; i < e.segments.length; i++) {
    const s = e.segments[i];
    const covered = Math.max(0, Math.min(s.dur, active - acc));
    if (s.type === 'run') {
      run += covered;
      curRun += covered;
      if (curRun > longest) longest = curRun;
    } else {
      walk += covered;
      if (covered > 0) curRun = 0;
    }
    if (!s.extra) plannedDone += covered;
    if (!found && !done && active < acc + s.dur) { idx = i; segEl = active - acc; found = true; }
    acc += s.dur;
  }
  if (done) { idx = e.segments.length - 1; segEl = e.segments[idx].dur; }
  const seg = e.segments[idx];
  return {
    idx, seg, segEl,
    segRemaining: Math.max(0, seg.dur - segEl),
    active,
    // after the plan ends, total stops growing at the moment the plan ended
    total: done ? sum + pauseSec : totalSec,
    pause: pauseSec,
    paused: isPaused(e),
    run, walk, longest,
    remaining: Math.max(0, sum - active),
    plannedDone: Math.min(plannedDone, e.planned),
    done,
  };
}

export function pause(e: EngineState, now: number) {
  if (!isPaused(e)) e.pauses.push({ start: now, end: null });
}

export function resume(e: EngineState, now: number) {
  if (isPaused(e)) e.pauses[e.pauses.length - 1].end = now;
}

export const canExtraWalk = (snap: Snapshot) =>
  !snap.done && !snap.paused && snap.seg.type === 'run' && !snap.seg.role && snap.segRemaining > 30;

/**
 * Inserts a 1-minute walk into the current run. The rest of the run follows
 * after the walk, so the planned running time is unchanged.
 */
export function addExtraWalk(e: EngineState, now: number, walkSec = 60): boolean {
  const snap = snapshot(e, now);
  if (!canExtraWalk(snap)) return false;
  const cur = e.segments[snap.idx];
  const el = Math.round(snap.segEl * 1000) / 1000;
  const remain = cur.dur - el;
  cur.dur = el;
  const ins: Segment[] = [{ type: 'walk', dur: walkSec, extra: true }];
  if (remain > 0.5) ins.push({ type: 'run', dur: remain, resumed: true });
  e.segments.splice(snap.idx + 1, 0, ...ins);
  // a zero-length piece would be confusing in the timeline
  if (cur.dur <= 0) e.segments.splice(snap.idx, 1);
  return true;
}

/** Count of original run intervals and which one (1-based) is current. */
export function runIntervalInfo(e: EngineState, idx: number): { n: number; of: number } {
  const originals = e.segments.filter((s) => s.type === 'run' && !s.resumed);
  const cur = e.segments[idx];
  if (!cur || cur.type !== 'run') return { n: 0, of: originals.length };
  let orig: Segment | undefined = cur;
  if (cur.resumed) orig = e.segments.slice(0, idx).reverse().find((s) => s.type === 'run' && !s.resumed);
  return { n: orig ? originals.indexOf(orig) + 1 : 0, of: originals.length };
}
