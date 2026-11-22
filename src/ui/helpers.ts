import { isoDate, parseIsoDate, todayIso, weekday } from '../core/dates';
import { shortDur } from '../core/format';
import type { Lang, SessionSpec } from '../core/types';
import type { Strings } from '../i18n/strings';
import type { T } from '../store/store';

export function fmtDate(iso: string, L: Strings, lang: Lang): string {
  const d = parseIsoDate(iso);
  const today = todayIso();
  const tm = new Date(); tm.setDate(tm.getDate() + 1);
  if (iso === today) return L.today;
  if (iso === isoDate(tm)) return L.tomorrow;
  const dot = lang === 'da' || lang === 'de' ? '.' : '';
  return `${L.days[weekday(d)]} ${d.getDate()}${dot} ${L.months[d.getMonth()]}`;
}

export function sessSummary(spec: SessionSpec, t: T, lang: Lang): string {
  const [reps, r, w] = spec;
  if (reps === 1) return `${t('run')} ${shortDur(r, lang)}`;
  return `${reps} × (${t('run').toLowerCase()} ${shortDur(r, lang)}${w ? ` / ${t('walk').toLowerCase()} ${shortDur(w, lang)}` : ''})`;
}
