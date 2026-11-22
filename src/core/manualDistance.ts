import type { WorkoutRecord } from './types';

/** Parses "3,2", "3.2" or "3" into km; returns null when it is not a number. */
export function parseKm(text: string): number | null {
  const t = text.trim().replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(t)) return null;
  return Number(t);
}

/**
 * A typed-in treadmill distance must be plausible: 0.1–60 km, and no more
 * than running at 22 km/h and walking at 9 km/h for the session's
 * running and walking time would give.
 */
export function isPlausibleKm(km: number, runSec: number, walkSec: number): boolean {
  if (!(km >= 0.1 && km <= 60)) return false;
  const max = (runSec / 3600) * 22 + (walkSec / 3600) * 9;
  return km <= max + 0.05;
}

/** Sets or removes the typed-in distance on a treadmill workout. Outdoor (GPS) workouts are never changed. */
export function setManualDistance(history: WorkoutRecord[], id: string, km: number | null): boolean {
  const r = history.find((h) => h.id === id);
  if (!r || r.env !== 'treadmill') return false;
  if (km === null) { delete r.dist; delete r.distSource; }
  else { r.dist = Math.round(km * 1000) / 1000; r.distSource = 'manual'; }
  return true;
}
