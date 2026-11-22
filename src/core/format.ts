import type { Lang } from './types';

export function clock(sec: number): string {
  sec = Math.max(0, Math.round(sec));
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  return (h ? h + ':' + String(m).padStart(2, '0') : String(m)) + ':' + String(s).padStart(2, '0');
}

/** Countdown display: never show 0:00 while time is left */
export const countdownClock = (sec: number) => clock(Math.ceil(sec - 1e-6));

export function shortDur(sec: number, lang: Lang): string {
  sec = Math.round(sec);
  const min = 'min';
  if (sec % 60 === 0) return sec / 60 + ' ' + min;
  if (sec < 60) return sec + ' s';
  return Math.floor(sec / 60) + ' ' + min + ' ' + (sec % 60) + ' s';
}

export function minutesText(sec: number, lang: Lang): string {
  const m = Math.round(sec / 60);
  if (m < 60) return m + ' min';
  return Math.floor(m / 60) + (lang === 'da' ? ' t ' : lang === 'de' ? ' Std. ' : ' h ') + (m % 60) + ' min';
}

const dec = (lang: Lang) => (lang === 'en' ? '.' : ',');
export const km = (v: number, lang: Lang) => v.toFixed(2).replace('.', dec(lang));
export const kmh = (v: number, lang: Lang) => v.toFixed(1).replace('.', dec(lang));

export function pace(minPerKm: number): string {
  if (!isFinite(minPerKm) || minPerKm <= 0 || minPerKm > 40) return '–:––';
  let m = Math.floor(minPerKm), s = Math.round((minPerKm - m) * 60);
  if (s === 60) { m++; s = 0; }
  return m + ':' + String(s).padStart(2, '0');
}
