import type { ProgramId, Segment, SessionSpec } from './types';

/**
 * All three programs share the same principle: gradual progression with
 * run/walk intervals, three sessions a week. Every session starts and ends
 * with 2 minutes of walking (added in buildSegments).
 */
const W5: SessionSpec[][] = [
  [[8, 60, 90], [8, 60, 90], [8, 60, 90]],
  [[6, 120, 90], [6, 120, 90], [6, 120, 90]],
  [[5, 180, 90], [5, 180, 90], [5, 180, 90]],
  [[4, 300, 120], [4, 300, 120], [4, 300, 120]],
  [[3, 480, 120], [2, 600, 120], [1, 1200, 0]],
  [[2, 720, 120], [2, 780, 120], [1, 1500, 0]],
  [[1, 1500, 0], [2, 840, 60], [1, 1680, 0]],
  [[1, 1680, 0], [1, 1800, 0], [1, 1800, 0]],
];
const W10: SessionSpec[][] = W5.concat([
  [[1, 1920, 0], [2, 1080, 120], [1, 2100, 0]],
  [[1, 2100, 0], [2, 1200, 120], [1, 2400, 0]],
  [[1, 2400, 0], [3, 900, 120], [1, 2700, 0]],
  [[1, 2700, 0], [2, 1500, 120], [1, 2880, 0]],
  [[1, 2880, 0], [3, 1080, 90], [1, 3120, 0]],
  [[1, 3000, 0], [2, 1680, 120], [1, 3300, 0]],
  [[1, 3000, 0], [1, 2400, 0], [1, 3600, 0]],
]);
const WHM: SessionSpec[][] = W10.concat([
  [[1, 2700, 0], [1, 3000, 0], [4, 1080, 120]],
  [[1, 2700, 0], [1, 3300, 0], [5, 1020, 120]],
  [[1, 3000, 0], [1, 3300, 0], [6, 960, 120]],
  [[1, 3000, 0], [1, 3600, 0], [6, 1080, 120]],
  [[1, 2700, 0], [1, 3300, 0], [7, 1020, 120]],
  [[1, 2400, 0], [1, 1800, 0], [7, 1080, 90]],
]);

export interface Program {
  id: ProgramId;
  km: string;
  goal: string;
  weeks: SessionSpec[][];
}

export const PROGRAMS: Program[] = [
  { id: 'p5', km: '5', goal: '5 km', weeks: W5 },
  { id: 'p10', km: '10', goal: '10 km', weeks: W10 },
  { id: 'phm', km: '21,1', goal: '21,1 km', weeks: WHM },
];

export const WARMUP = 120;
export const COOLDOWN = 120;

export function getProgram(id: ProgramId): Program {
  const p = PROGRAMS.find((x) => x.id === id);
  if (!p) throw new Error('Unknown program ' + id);
  return p;
}

export function buildSegments(spec: SessionSpec): Segment[] {
  const [reps, run, walk] = spec;
  const segs: Segment[] = [{ type: 'walk', role: 'warm', dur: WARMUP }];
  for (let i = 0; i < reps; i++) {
    segs.push({ type: 'run', dur: run });
    if (walk && i < reps - 1) segs.push({ type: 'walk', dur: walk });
  }
  segs.push({ type: 'walk', role: 'cool', dur: COOLDOWN });
  return segs;
}

export const sessionSpec = (pid: ProgramId, w: number, s: number) => getProgram(pid).weeks[w][s];
export const sessionSegments = (pid: ProgramId, w: number, s: number) => buildSegments(sessionSpec(pid, w, s));
export const segmentsTotal = (segs: Segment[]) => segs.reduce((a, b) => a + b.dur, 0);
export const segmentsRun = (segs: Segment[]) => segs.filter((x) => x.type === 'run').reduce((a, b) => a + b.dur, 0);
export const totalSessions = (pid: ProgramId) => getProgram(pid).weeks.length * 3;
export const isFinalSession = (pid: ProgramId, w: number, s: number) => w === getProgram(pid).weeks.length - 1 && s === 2;

export function nextPos(pid: ProgramId, w: number, s: number): { w: number; s: number } | null {
  let nw = w, ns = s + 1;
  if (ns > 2) { ns = 0; nw++; }
  if (nw >= getProgram(pid).weeks.length) return null;
  return { w: nw, s: ns };
}
