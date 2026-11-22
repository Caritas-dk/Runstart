import { getProgram } from './programs';
import type { ProgramId, WorkoutRecord } from './types';

/**
 * Milestones are derived from the workout history alone, so they survive
 * backup/restore and never get out of sync. Distance only exists for outdoor
 * sessions (treadmill sessions record time only).
 */
export type MilestoneCategory = 'total' | 'session' | 'count' | 'continuous' | 'program';

export interface Milestone {
  id: string;
  cat: MilestoneCategory;
  /** km, number of sessions, minutes – depending on category */
  value: number;
  /** short label on the badge, language-neutral */
  badge: string;
  pid?: ProgramId;
}

export const MILESTONES: Milestone[] = [
  { id: 'first_session', cat: 'count', value: 1, badge: '1' },
  { id: 'week_1', cat: 'count', value: 3, badge: '3×' },
  { id: 'sessions_10', cat: 'count', value: 10, badge: '10×' },
  { id: 'sessions_25', cat: 'count', value: 25, badge: '25×' },
  { id: 'sessions_50', cat: 'count', value: 50, badge: '50×' },

  { id: 'run_5', cat: 'continuous', value: 5, badge: '5′' },
  { id: 'run_10', cat: 'continuous', value: 10, badge: '10′' },
  { id: 'run_20', cat: 'continuous', value: 20, badge: '20′' },
  { id: 'run_30', cat: 'continuous', value: 30, badge: '30′' },
  { id: 'run_60', cat: 'continuous', value: 60, badge: '60′' },

  { id: 'sess_1', cat: 'session', value: 1, badge: '1 km' },
  { id: 'sess_5', cat: 'session', value: 5, badge: '5 km' },
  { id: 'sess_10', cat: 'session', value: 10, badge: '10 km' },
  { id: 'sess_15', cat: 'session', value: 15, badge: '15 km' },
  { id: 'sess_21', cat: 'session', value: 21.0975, badge: '21,1' },

  { id: 'total_10', cat: 'total', value: 10, badge: '10 km' },
  { id: 'total_21', cat: 'total', value: 21.0975, badge: '21,1' },
  { id: 'total_42', cat: 'total', value: 42.195, badge: '42,2' },
  { id: 'total_100', cat: 'total', value: 100, badge: '100' },
  { id: 'total_250', cat: 'total', value: 250, badge: '250' },
  { id: 'total_500', cat: 'total', value: 500, badge: '500' },

  { id: 'prog_p5', cat: 'program', value: 0, badge: '5 km', pid: 'p5' },
  { id: 'prog_p10', cat: 'program', value: 0, badge: '10 km', pid: 'p10' },
  { id: 'prog_phm', cat: 'program', value: 0, badge: '21,1', pid: 'phm' },
];

export const CATEGORY_ORDER: MilestoneCategory[] = ['total', 'session', 'continuous', 'count', 'program'];

/** GPS distances are rounded; a small tolerance avoids "4.998 km is not 5 km". */
const KM_TOLERANCE = 0.02;

export const totalKm = (history: WorkoutRecord[]) => history.reduce((a, h) => a + (h.dist || 0), 0);

/** Has the user done all three sessions of some program week (completed)? */
function hasFullWeek(history: WorkoutRecord[]): boolean {
  const keys = new Set(history.filter((h) => h.completed).map((h) => `${h.pid}-${h.w}-${h.s}`));
  for (const k of keys) {
    const [pid, w] = k.split('-');
    if ([0, 1, 2].every((s) => keys.has(`${pid}-${w}-${s}`))) return true;
  }
  return false;
}

function programDone(history: WorkoutRecord[], pid: ProgramId): boolean {
  const weeks = getProgram(pid).weeks.length;
  return history.some((h) => h.pid === pid && h.completed && h.w === weeks - 1 && h.s === 2);
}

export function isAchieved(m: Milestone, history: WorkoutRecord[]): boolean {
  const completed = history.filter((h) => h.completed).length;
  switch (m.cat) {
    case 'total': return totalKm(history) + KM_TOLERANCE >= m.value;
    case 'session': return history.some((h) => (h.dist || 0) + KM_TOLERANCE >= m.value);
    case 'continuous': return history.some((h) => h.longest >= m.value * 60 - 1);
    case 'count': return m.id === 'week_1' ? hasFullWeek(history) : completed >= m.value;
    case 'program': return programDone(history, m.pid!);
  }
}

export const achievedIds = (history: WorkoutRecord[]) => MILESTONES.filter((m) => isAchieved(m, history)).map((m) => m.id);

/** Milestones reached by adding the last workout, in display order. */
export function newMilestones(before: WorkoutRecord[], after: WorkoutRecord[]): Milestone[] {
  return MILESTONES.filter((m) => !isAchieved(m, before) && isAchieved(m, after));
}

/** Next distance milestone and how far away it is. */
export function nextTotalMilestone(history: WorkoutRecord[]): { m: Milestone; left: number } | null {
  const km = totalKm(history);
  const m = MILESTONES.find((x) => x.cat === 'total' && km + KM_TOLERANCE < x.value);
  return m ? { m, left: Math.max(0, m.value - km) } : null;
}

/** Pick the most impressive new milestone to praise by voice. */
export function headlineMilestone(ms: Milestone[]): Milestone | null {
  if (!ms.length) return null;
  const rank: Record<MilestoneCategory, number> = { program: 5, session: 4, total: 3, continuous: 2, count: 1 };
  return ms.slice().sort((a, b) => rank[b.cat] - rank[a.cat] || b.value - a.value)[0];
}

/** Date (ISO timestamp of the workout) when each milestone was first reached. */
export function achievedDates(history: WorkoutRecord[]): Record<string, string> {
  const sorted = history.slice().sort((a, b) => a.date.localeCompare(b.date));
  const out: Record<string, string> = {};
  for (let i = 0; i < sorted.length; i++) {
    const prefix = sorted.slice(0, i + 1);
    for (const m of MILESTONES) if (!out[m.id] && isAchieved(m, prefix)) out[m.id] = sorted[i].date;
  }
  return out;
}
