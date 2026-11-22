/** Pure GPS distance/pace tracking. Points are fed in by the location service. */
export interface GpsPoint { lat: number; lon: number; t: number; acc?: number | null; speed?: number | null }

export interface GpsTrack {
  dist: number; // km
  last: GpsPoint | null;
  /** recent points for current-pace estimation */
  recent: { t: number; d: number }[];
  /** smoothed current speed, km/h */
  speed: number;
  kmAnnounced: number;
}

export const newTrack = (): GpsTrack => ({ dist: 0, last: null, recent: [], speed: 0, kmAnnounced: 0 });

export function haversineKm(a: GpsPoint, b: GpsPoint) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180, la2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

const MAX_ACC_M = 30;
const MAX_KMH = 30;
const WINDOW_MS = 20000;

/**
 * Adds a GPS fix. While paused the point only moves the reference, so
 * walking around during a pause does not count.
 */
export function addPoint(tr: GpsTrack, p: GpsPoint, paused: boolean): void {
  if (p.acc != null && p.acc > MAX_ACC_M) return;
  if (!tr.last || paused) { tr.last = p; if (paused) { tr.recent = []; tr.speed = 0; } return; }
  const dt = (p.t - tr.last.t) / 1000;
  if (dt <= 0) return;
  const d = haversineKm(tr.last, p);
  if ((d / dt) * 3600 > MAX_KMH) { tr.last = p; return; } // GPS jump
  tr.dist += d;
  tr.last = p;
  tr.recent.push({ t: p.t, d: tr.dist });
  while (tr.recent.length > 2 && p.t - tr.recent[0].t > WINDOW_MS) tr.recent.shift();
  const first = tr.recent[0];
  const span = (p.t - first.t) / 1000;
  const fromWindow = span >= 4 ? ((tr.dist - first.d) / span) * 3600 : NaN;
  const fromSensor = p.speed != null && p.speed >= 0 ? p.speed * 3.6 : NaN;
  const est = !isNaN(fromSensor) ? (isNaN(fromWindow) ? fromSensor : (fromSensor + fromWindow) / 2) : fromWindow;
  if (!isNaN(est)) tr.speed = tr.speed ? tr.speed * 0.6 + est * 0.4 : est;
}

/** Returns the whole km just passed, or 0. */
export function takeKmMilestone(tr: GpsTrack): number {
  const km = Math.floor(tr.dist + 1e-9);
  if (km > tr.kmAnnounced) { tr.kmAnnounced = km; return km; }
  return 0;
}

/** minutes per km, or NaN */
export const paceFromSpeed = (kmh: number) => (kmh > 1 ? 60 / kmh : NaN);
export const avgPace = (activeSec: number, km: number) => (km > 0.01 ? activeSec / 60 / km : NaN);
