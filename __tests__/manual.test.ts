import { isPlausibleKm, parseKm, setManualDistance } from '../src/core/manualDistance';
import { newMilestones, totalKm } from '../src/core/milestones';
import type { WorkoutRecord } from '../src/core/types';

const rec = (o: Partial<WorkoutRecord>): WorkoutRecord => ({
  id: 'a', pid: 'p5', w: 0, s: 0, env: 'treadmill', date: '2026-11-20T07:00:00Z', completed: true, completion: 1,
  total: 1800, active: 1800, run: 1200, walk: 600, pause: 0, longest: 600, repeat: false, rating: null, ...o,
});

describe('treadmill distance typed in afterwards', () => {
  it('parses comma and dot', () => {
    expect(parseKm('3,2')).toBe(3.2);
    expect(parseKm(' 3.25 ')).toBe(3.25);
    expect(parseKm('5')).toBe(5);
    expect(parseKm('abc')).toBeNull();
    expect(parseKm('')).toBeNull();
    expect(parseKm('-2')).toBeNull();
  });
  it('rejects implausible distances', () => {
    // week 1: 8 min running, 14.5 min walking -> at most ~5.1 km
    expect(isPlausibleKm(3.1, 480, 870)).toBe(true);
    expect(isPlausibleKm(9, 480, 870)).toBe(false);
    expect(isPlausibleKm(0.05, 480, 870)).toBe(false);
    expect(isPlausibleKm(61, 36000, 0)).toBe(false);
  });
  it('counts towards total km and milestones; outdoor GPS distance is never overwritten', () => {
    const h = [rec({ id: 'tm' }), rec({ id: 'out', env: 'outdoor', dist: 2, distSource: 'gps' })];
    const before = h.map((x) => ({ ...x }));
    expect(setManualDistance(h, 'tm', 5.1)).toBe(true);
    expect(h[0]).toMatchObject({ dist: 5.1, distSource: 'manual' });
    expect(totalKm(h)).toBeCloseTo(7.1);
    expect(newMilestones(before, h).map((m) => m.id)).toContain('sess_5');
    expect(setManualDistance(h, 'out', 9)).toBe(false);
    expect(h[1].dist).toBe(2);
    setManualDistance(h, 'tm', null);
    expect(h[0].dist).toBeUndefined();
    expect(totalKm(h)).toBeCloseTo(2);
  });
});
