export const isoDate = (d: Date) =>
  d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');

export const parseIsoDate = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const todayIso = (now: Date = new Date()) => isoDate(now);

/** 0 = Monday … 6 = Sunday */
export const weekday = (d: Date) => (d.getDay() + 6) % 7;

export const daysBetween = (a: string, b: string) =>
  Math.round((parseIsoDate(b).getTime() - parseIsoDate(a).getTime()) / 864e5);

export const addDays = (s: string, n: number) => {
  const d = parseIsoDate(s);
  d.setDate(d.getDate() + n);
  return isoDate(d);
};

/** Monday of the week containing d (local time, 00:00) */
export function mondayOf(d: Date): Date {
  const m = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  m.setDate(m.getDate() - weekday(m));
  return m;
}
