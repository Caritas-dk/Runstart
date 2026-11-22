import { mondayOf } from './dates';
import type { ProgramId, WorkoutRecord } from './types';

export interface ProgramStats {
  completed: number;
  run: number;
  walk: number;
  longest: number;
  dist: number;
  workouts: WorkoutRecord[];
}

export function programStats(history: WorkoutRecord[], pid: ProgramId): ProgramStats {
  const hs = history.filter((h) => h.pid === pid).sort((a, b) => b.date.localeCompare(a.date));
  const keys = new Set(hs.filter((h) => h.completed).map((h) => h.w + '-' + h.s));
  return {
    completed: keys.size,
    run: hs.reduce((a, b) => a + b.run, 0),
    walk: hs.reduce((a, b) => a + b.walk, 0),
    longest: hs.reduce((a, b) => Math.max(a, b.longest), 0),
    dist: hs.reduce((a, b) => a + (b.dist || 0), 0),
    workouts: hs,
  };
}

export interface WeekBucket { start: Date; run: number; walk: number; count: number }

/** Minutes of running and walking per week (Monday start), oldest first. */
export function weeklyActivity(history: WorkoutRecord[], weeks = 8, now: Date = new Date()): WeekBucket[] {
  const mon = mondayOf(now);
  const out: WeekBucket[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const s = new Date(mon);
    s.setDate(s.getDate() - 7 * i);
    out.push({ start: s, run: 0, walk: 0, count: 0 });
  }
  history.forEach((r) => {
    const d = new Date(r.date);
    for (let i = out.length - 1; i >= 0; i--) {
      if (d >= out[i].start) {
        const end = new Date(out[i].start);
        end.setDate(end.getDate() + 7);
        if (d < end) { out[i].run += r.run / 60; out[i].walk += r.walk / 60; out[i].count++; }
        break;
      }
    }
  });
  return out;
}
