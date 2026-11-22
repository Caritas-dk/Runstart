import { MILESTONES, achievedDates, achievedIds, headlineMilestone, newMilestones, nextTotalMilestone, totalKm } from '../src/core/milestones';
import { MILESTONE_TEXTS } from '../src/i18n/milestones';
import type { WorkoutRecord } from '../src/core/types';

let n = 0;
const rec = (o: Partial<WorkoutRecord>): WorkoutRecord => ({
  id: 'r' + n++, pid: 'p5', w: 0, s: 0, env: 'treadmill', date: new Date(2026, 10, 1 + n).toISOString(), completed: true, completion: 1,
  total: 1500, active: 1500, run: 600, walk: 900, pause: 0, longest: 60, repeat: false, rating: null, ...o,
});

describe('milestones', () => {
  it('total km only counts outdoor distance', () => {
    const h = [rec({ env: 'outdoor', dist: 3.2 }), rec({}), rec({ env: 'outdoor', dist: 2 })];
    expect(totalKm(h)).toBeCloseTo(5.2);
  });

  it('first km, 5, 10, 15 km in one session', () => {
    const before = [rec({ env: 'outdoor', dist: 0.8 })];
    const after = [...before, rec({ env: 'outdoor', dist: 5.01 })];
    const ids = newMilestones(before, after).map((m) => m.id);
    expect(ids).toEqual(expect.arrayContaining(['sess_1', 'sess_5']));
    expect(ids).not.toContain('sess_10');
    // GPS rounding tolerance: 9.99 km counts as 10
    expect(newMilestones(after, [...after, rec({ env: 'outdoor', dist: 9.99 })]).map((m) => m.id)).toContain('sess_10');
    expect(achievedIds([rec({ env: 'outdoor', dist: 15.2 })])).toEqual(expect.arrayContaining(['sess_15', 'total_10']));
  });

  it('10 km and half marathon in total, celebrated only the first time', () => {
    const h: WorkoutRecord[] = [];
    const seen: string[] = [];
    for (let i = 0; i < 8; i++) {
      const next = [...h, rec({ env: 'outdoor', dist: 3 })];
      seen.push(...newMilestones(h, next).map((m) => m.id));
      h.push(next[next.length - 1]);
    }
    expect(seen.filter((x) => x === 'total_10')).toHaveLength(1);
    expect(seen.filter((x) => x === 'total_21')).toHaveLength(1);
    expect(nextTotalMilestone(h)?.m.id).toBe('total_42');
  });

  it('partial sessions count for distance but not for completed-session milestones', () => {
    const h = [rec({ completed: false, completion: 0.5, env: 'outdoor', dist: 1.2 })];
    const ids = achievedIds(h);
    expect(ids).toContain('sess_1');
    expect(ids).not.toContain('first_session');
  });

  it('continuous running, session counts, first full week and program completion', () => {
    const h = [rec({ s: 0 }), rec({ s: 1 }), rec({ s: 2, longest: 300 })];
    expect(achievedIds(h)).toEqual(expect.arrayContaining(['first_session', 'week_1', 'run_5']));
    expect(achievedIds(h)).not.toContain('sessions_10');
    expect(achievedIds([rec({ w: 7, s: 2 })])).toContain('prog_p5');
    expect(achievedIds([rec({ w: 7, s: 2, completed: false })])).not.toContain('prog_p5');
  });

  it('repeats of the same session do not make a full week', () => {
    expect(achievedIds([rec({ s: 0 }), rec({ s: 0 }), rec({ s: 0 })])).not.toContain('week_1');
  });

  it('headline praise prefers the biggest achievement', () => {
    const ms = MILESTONES.filter((m) => ['first_session', 'sess_5', 'total_10'].includes(m.id));
    expect(headlineMilestone(ms)?.id).toBe('sess_5');
  });

  it('dates come from the workout where the milestone was reached', () => {
    const a = rec({ date: '2026-11-01T07:00:00.000Z' });
    const b = rec({ date: '2026-11-03T07:00:00.000Z', longest: 600 });
    const d = achievedDates([b, a]);
    expect(d.first_session).toBe(a.date);
    expect(d.run_10).toBe(b.date);
  });

  it('every milestone has a title and praise in all five languages', () => {
    for (const lang of ['da', 'en', 'fr', 'de', 'es'] as const) {
      for (const m of MILESTONES) {
        const t = MILESTONE_TEXTS[lang][m.id];
        expect([lang, m.id, !!t && t[0].length > 2 && t[1].length > 10]).toEqual([lang, m.id, true]);
      }
    }
  });
});
