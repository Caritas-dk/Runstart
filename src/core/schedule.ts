import { getProgram } from './programs';
import { isoDate, parseIsoDate, todayIso, weekday } from './dates';
import type { AppData, ProgramId, ProgramState, WorkoutRecord } from './types';

export interface ScheduledSession { w: number; s: number; date: string; moved?: boolean }

/**
 * Upcoming sessions from the current position, placed on the chosen
 * training days. Sessions the user moved keep their chosen date, and other
 * sessions skip those dates.
 */
export function buildSchedule(pid: ProgramId, ps: ProgramState | undefined, today: string = todayIso()): ScheduledSession[] {
  if (!ps || ps.finished || ps.days.length === 0) return [];
  const prog = getProgram(pid);
  const out: ScheduledSession[] = [];
  const start = parseIsoDate(ps.startDate > today ? ps.startDate : today);
  const taken = new Set(Object.values(ps.moved || {}));
  let { w, s } = ps.pos;
  let guard = 0;
  while (w < prog.weeks.length && guard < 1000) {
    guard++;
    const key = w + '-' + s;
    const movedTo = ps.moved?.[key];
    if (movedTo) {
      out.push({ w, s, date: movedTo, moved: true });
    } else {
      while (!(ps.days.includes(weekday(start)) && !taken.has(isoDate(start)))) start.setDate(start.getDate() + 1);
      out.push({ w, s, date: isoDate(start) });
      start.setDate(start.getDate() + 1);
    }
    s++;
    if (s > 2) { s = 0; w++; }
  }
  return out.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.w - b.w || a.s - b.s));
}

/** The next session to do is always the program position (even if a later one was moved earlier). */
export function nextSession(pid: ProgramId, ps: ProgramState | undefined, today?: string) {
  if (!ps || ps.finished) return null;
  return buildSchedule(pid, ps, today).find((x) => x.w === ps.pos.w && x.s === ps.pos.s) ?? null;
}

export function completedKeys(history: WorkoutRecord[], pid: ProgramId): Set<string> {
  const set = new Set<string>();
  history.forEach((h) => { if (h.pid === pid && h.completed) set.add(h.w + '-' + h.s); });
  return set;
}

export function newProgramState(w: number, s: number, days: number[], startDate: string, goalDate: string): ProgramState {
  return { pos: { w, s }, days: days.slice().sort((a, b) => a - b), startDate, goalDate, moved: {}, finished: false };
}

/**
 * Applies a finished workout to the program. Only a completed session at
 * the current position moves the program forward; partial sessions and
 * repeats of other sessions never do.
 */
export function applyWorkoutToProgram(data: AppData, rec: WorkoutRecord): { advanced: null | 'done' | { w: number; s: number } } {
  const ps = data.programs[rec.pid];
  if (!rec.completed || !ps || ps.finished || ps.pos.w !== rec.w || ps.pos.s !== rec.s) return { advanced: null };
  delete ps.moved[rec.w + '-' + rec.s];
  let { w, s } = ps.pos;
  s++;
  if (s > 2) { s = 0; w++; }
  if (w >= getProgram(rec.pid).weeks.length) { ps.finished = true; return { advanced: 'done' }; }
  ps.pos = { w, s };
  return { advanced: { w, s } };
}
