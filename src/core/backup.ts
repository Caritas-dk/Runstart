import type { AppData, Settings } from './types';

export const DEFAULT_SETTINGS: Settings = {
  lang: 'en', voiceLang: 'en', voiceAmount: 'full', volume: 0.9, vibration: true,
  countdown: 3, kmVoice: true, reminders: false, reminderTime: '07:30',
};

export const defaultData = (): AppData => ({
  settings: { ...DEFAULT_SETTINGS }, active: null, programs: {}, history: [], onboarded: false,
});

export function serializeBackup(d: AppData, now = new Date()): string {
  return JSON.stringify({ app: 'runstart', version: 1, exported: now.toISOString(), data: d }, null, 1);
}

const PIDS = ['p5', 'p10', 'phm'];
export const LANGS = ['da', 'en', 'fr', 'de', 'es'];

/** Parses and validates a backup. Throws on anything that does not look right. */
export function parseBackup(text: string): AppData {
  const j = JSON.parse(text);
  const d = j && typeof j === 'object' && 'data' in j ? j.data : j;
  if (!d || typeof d !== 'object' || !d.settings || !Array.isArray(d.history)) throw new Error('invalid');
  for (const h of d.history) {
    if (!h || !PIDS.includes(h.pid) || typeof h.w !== 'number' || typeof h.s !== 'number' || typeof h.date !== 'string') throw new Error('invalid');
  }
  const programs: AppData['programs'] = {};
  for (const k of Object.keys(d.programs || {})) {
    if (!PIDS.includes(k)) continue;
    const p = d.programs[k];
    if (!p || !p.pos || !Array.isArray(p.days)) throw new Error('invalid');
    programs[k as keyof AppData['programs']] = { moved: {}, goalDate: '', finished: false, ...p };
  }
  const settings = { ...DEFAULT_SETTINGS, ...d.settings };
  if (!LANGS.includes(settings.lang)) settings.lang = DEFAULT_SETTINGS.lang;
  if (!LANGS.includes(settings.voiceLang)) settings.voiceLang = DEFAULT_SETTINGS.voiceLang;
  return {
    settings,
    active: PIDS.includes(d.active) ? d.active : null,
    programs,
    history: d.history,
    onboarded: true,
  };
}
