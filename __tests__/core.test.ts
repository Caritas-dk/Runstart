import { PROGRAMS, buildSegments, getProgram, segmentsTotal, sessionSegments } from '../src/core/programs';
import { createEngine, snapshot, pause, resume, addExtraWalk, canExtraWalk, runIntervalInfo } from '../src/core/engine';
import { cuesBetween } from '../src/core/cues';
import { buildSchedule, applyWorkoutToProgram, newProgramState, nextSession } from '../src/core/schedule';
import { addPoint, newTrack, takeKmMilestone } from '../src/core/gps';
import { weeklyActivity, programStats } from '../src/core/stats';
import { parseBackup, serializeBackup, defaultData } from '../src/core/backup';
import { pace, clock, countdownClock } from '../src/core/format';
import type { WorkoutRecord } from '../src/core/types';

const T0 = 1_700_000_000_000;
const at = (sec: number) => T0 + sec * 1000;

describe('programs', () => {
  it('have 8, 15 and 21 weeks with 3 sessions each', () => {
    expect(PROGRAMS.map((p) => p.weeks.length)).toEqual([8, 15, 21]);
    PROGRAMS.forEach((p) => p.weeks.forEach((w) => expect(w).toHaveLength(3)));
  });
  it('every session starts and ends with 2 minutes walking', () => {
    PROGRAMS.forEach((p) => p.weeks.forEach((w, wi) => w.forEach((_, si) => {
      const s = sessionSegments(p.id, wi, si);
      expect(s[0]).toMatchObject({ type: 'walk', role: 'warm', dur: 120 });
      expect(s[s.length - 1]).toMatchObject({ type: 'walk', role: 'cool', dur: 120 });
    })));
  });
  it('running time never goes down by much from week to week (gradual progression)', () => {
    PROGRAMS.forEach((p) => {
      const longestPerWeek = p.weeks.map((w) => Math.max(...w.map((s) => s[1])));
      // the final week is a taper before the goal session
      for (let i = 1; i < longestPerWeek.length - 1; i++) expect(longestPerWeek[i]).toBeGreaterThanOrEqual(longestPerWeek[i - 1] * 0.75);
    });
  });
  it('builds run/walk alternation without a trailing walk before the cool-down', () => {
    const s = buildSegments([3, 60, 90]);
    expect(s.map((x) => x.type)).toEqual(['walk', 'run', 'walk', 'run', 'walk', 'run', 'walk']);
    expect(segmentsTotal(s)).toBe(120 + 180 + 180 + 120);
  });
});

describe('engine', () => {
  const segs = buildSegments([2, 60, 60]); // 120 w, 60 r, 60 w, 60 r, 120 w = 420
  it('tracks interval, active, remaining and total time', () => {
    const e = createEngine(segs, T0);
    const s = snapshot(e, at(150));
    expect(s.idx).toBe(1);
    expect(s.segEl).toBeCloseTo(30);
    expect(s.active).toBeCloseTo(150);
    expect(s.remaining).toBeCloseTo(270);
    expect(s.run).toBeCloseTo(30);
    expect(s.walk).toBeCloseTo(120);
  });
  it('pause freezes the interval but total time keeps counting', () => {
    const e = createEngine(segs, T0);
    pause(e, at(150));
    const p = snapshot(e, at(200));
    expect(p.paused).toBe(true);
    expect(p.segEl).toBeCloseTo(30);
    expect(p.active).toBeCloseTo(150);
    expect(p.total).toBeCloseTo(200);
    expect(p.pause).toBeCloseTo(50);
    resume(e, at(200));
    const r = snapshot(e, at(210));
    expect(r.segEl).toBeCloseTo(40);
    expect(r.total).toBeCloseTo(210);
  });
  it('total = run + walk + pauses at the end and stops growing', () => {
    const e = createEngine(segs, T0);
    pause(e, at(100)); resume(e, at(130));
    const s = snapshot(e, at(10_000));
    expect(s.done).toBe(true);
    expect(s.total).toBeCloseTo(450);
    expect(s.run + s.walk + s.pause).toBeCloseTo(s.total);
    expect(s.plannedDone).toBeCloseTo(420);
  });
  it('extra walk splits the run and keeps planned running time', () => {
    const e = createEngine(buildSegments([1, 600, 0]), T0);
    expect(canExtraWalk(snapshot(e, at(200)))).toBe(true);
    expect(addExtraWalk(e, at(200))).toBe(true);
    expect(e.segments.map((x) => [x.type, Math.round(x.dur), !!x.extra])).toEqual([
      ['walk', 120, false], ['run', 80, false], ['walk', 60, true], ['run', 520, false], ['walk', 120, false]]);
    const s = snapshot(e, at(100_000));
    expect(s.run).toBeCloseTo(600);
    expect(s.walk).toBeCloseTo(300);
    expect(s.plannedDone).toBeCloseTo(e.planned);
    expect(s.longest).toBeCloseTo(520);
    expect(runIntervalInfo(e, 3)).toEqual({ n: 1, of: 1 });
  });
  it('no extra walk during warm-up, walks or last 30 s of a run', () => {
    const e = createEngine(buildSegments([1, 600, 0]), T0);
    expect(canExtraWalk(snapshot(e, at(10)))).toBe(false);
    expect(canExtraWalk(snapshot(e, at(120 + 580)))).toBe(false);
  });
  it('survives suspension: a big time jump lands in the right interval', () => {
    const e = createEngine(segs, T0);
    const s = snapshot(e, at(270));
    expect(s.idx).toBe(3);
  });
});

describe('cues', () => {
  const o = { voiceAmount: 'full' as const, countdown: 3 };
  const e = createEngine(buildSegments([1, 600, 0]), T0);
  it('announces a new interval', () => {
    expect(cuesBetween(snapshot(e, at(119.5)), snapshot(e, at(120.2)), o, 600)).toEqual([{ kind: 'segment', idx: 1 }]);
  });
  it('halfway, coming up and countdown', () => {
    expect(cuesBetween(snapshot(e, at(419.8)), snapshot(e, at(420.1)), o, 120)).toContainEqual({ kind: 'half' });
    expect(cuesBetween(snapshot(e, at(704.9)), snapshot(e, at(705.1)), o, 120)).toContainEqual({ kind: 'next', idx: 2 });
    expect(cuesBetween(snapshot(e, at(716.9)), snapshot(e, at(717.1)), o, 120)).toContainEqual({ kind: 'countdown', n: 3 });
  });
  it('basic mode only says changes', () => {
    const b = { voiceAmount: 'basic' as const, countdown: 0 };
    expect(cuesBetween(snapshot(e, at(419.8)), snapshot(e, at(420.1)), b, 120)).toEqual([]);
  });
  it('no backlog after a long suspension within one interval', () => {
    expect(cuesBetween(snapshot(e, at(130)), snapshot(e, at(700)), o, 120)).toEqual([]);
  });
  it('done', () => {
    expect(cuesBetween(snapshot(e, at(839)), snapshot(e, at(841)), o)).toEqual([{ kind: 'done' }]);
  });
});

describe('schedule', () => {
  it('places sessions on the chosen weekdays', () => {
    const ps = newProgramState(0, 0, [0, 2, 4], '2026-11-16', ''); // Monday
    const sch = buildSchedule('p5', ps, '2026-11-16');
    expect(sch.slice(0, 4).map((x) => x.date)).toEqual(['2026-11-16', '2026-11-18', '2026-11-20', '2026-11-23']);
    expect(sch).toHaveLength(24);
  });
  it('moved dates are kept and other sessions avoid them', () => {
    const ps = newProgramState(0, 0, [0, 2, 4], '2026-11-16', '');
    ps.moved['0-1'] = '2026-11-17';
    const sch = buildSchedule('p5', ps, '2026-11-16');
    expect(sch.find((x) => x.s === 1 && x.w === 0)?.date).toBe('2026-11-17');
    expect(nextSession('p5', ps, '2026-11-16')?.date).toBe('2026-11-16');
  });
  const rec = (over: Partial<WorkoutRecord>): WorkoutRecord => ({
    id: 'x', pid: 'p5', w: 0, s: 0, env: 'treadmill', date: '2026-11-16T07:00:00Z', completed: true, completion: 1,
    total: 1, active: 1, run: 1, walk: 1, pause: 0, longest: 1, repeat: false, rating: null, ...over });
  it('only a completed session at the current position advances the program', () => {
    const d = defaultData();
    d.programs.p5 = newProgramState(0, 0, [0, 2, 4], '2026-11-16', '');
    expect(applyWorkoutToProgram(d, rec({ completed: false })).advanced).toBeNull();
    expect(d.programs.p5!.pos).toEqual({ w: 0, s: 0 });
    expect(applyWorkoutToProgram(d, rec({ w: 3 })).advanced).toBeNull();
    expect(applyWorkoutToProgram(d, rec({})).advanced).toEqual({ w: 0, s: 1 });
  });
  it('finishing the last session marks the program finished', () => {
    const d = defaultData();
    d.programs.p5 = newProgramState(7, 2, [0, 2, 4], '2026-11-16', '');
    expect(applyWorkoutToProgram(d, rec({ w: 7, s: 2 })).advanced).toBe('done');
    expect(d.programs.p5!.finished).toBe(true);
    expect(getProgram('p5').weeks).toHaveLength(8);
  });
});

describe('gps', () => {
  it('accumulates distance, ignores pauses, inaccurate fixes and jumps', () => {
    const tr = newTrack();
    // ~10 km/h northwards: 0.0000250 deg lat per second ≈ 2.78 m
    for (let i = 0; i <= 360; i++) addPoint(tr, { lat: 55 + i * 0.000025, lon: 12, t: at(i), acc: 5 }, false);
    expect(tr.dist).toBeCloseTo(1.0, 1);
    expect(tr.speed).toBeGreaterThan(9);
    expect(tr.speed).toBeLessThan(11);
    expect(takeKmMilestone(tr)).toBe(tr.dist >= 1 ? 1 : 0);
    const before = tr.dist;
    addPoint(tr, { lat: 55.1, lon: 12, t: at(400), acc: 5 }, true); // paused, walked far
    addPoint(tr, { lat: 55.1, lon: 12, t: at(401), acc: 80 }, false); // inaccurate
    addPoint(tr, { lat: 56, lon: 12, t: at(402), acc: 5 }, false); // jump
    expect(tr.dist).toBeCloseTo(before);
  });
});

describe('stats, backup, format', () => {
  it('weekly buckets and totals', () => {
    const now = new Date(2026, 10, 19, 12);
    const h: WorkoutRecord[] = [
      { id: 'a', pid: 'p5', w: 0, s: 0, env: 'outdoor', date: new Date(2026, 10, 17, 7).toISOString(), completed: true, completion: 1, total: 1500, active: 1350, run: 480, walk: 870, pause: 150, longest: 60, repeat: false, rating: 'right', dist: 2.5 },
      { id: 'b', pid: 'p5', w: 0, s: 0, env: 'treadmill', date: new Date(2026, 10, 10, 7).toISOString(), completed: false, completion: 0.5, total: 600, active: 600, run: 240, walk: 360, pause: 0, longest: 60, repeat: false, rating: null },
    ];
    const wk = weeklyActivity(h, 8, now);
    expect(wk[7].run).toBeCloseTo(8);
    expect(wk[6].run).toBeCloseTo(4);
    const st = programStats(h, 'p5');
    expect(st.completed).toBe(1);
    expect(st.dist).toBeCloseTo(2.5);
    expect(st.workouts).toHaveLength(2); // repeats and partials kept separately
  });
  it('backup round-trips and rejects junk', () => {
    const d = defaultData();
    d.settings.lang = 'en';
    d.programs.p10 = newProgramState(2, 1, [1, 3, 5], '2026-11-16', '2027-03-01');
    const back = parseBackup(serializeBackup(d));
    expect(back.settings.lang).toBe('en');
    expect(back.programs.p10?.pos).toEqual({ w: 2, s: 1 });
    expect(() => parseBackup('{"foo":1}')).toThrow();
    expect(() => parseBackup('not json')).toThrow();
  });
  it('formats', () => {
    expect(clock(3725)).toBe('1:02:05');
    expect(countdownClock(59.2)).toBe('1:00');
    expect(pace(5.999)).toBe('6:00');
    expect(pace(NaN)).toBe('–:––');
  });
});
