import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { defaultData, parseBackup } from '../core/backup';
import type { AppData, Lang } from '../core/types';
import { STRINGS, type Strings } from '../i18n/strings';

const KEY = 'runstart/data/v1';
let data: AppData = defaultData();
let loaded = false;
const listeners = new Set<() => void>();
let version = 0;

export async function loadData(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) {
      data = parseBackup(raw);
      data.onboarded = JSON.parse(raw).onboarded ?? true;
    }
    // first launch always starts in English; the flag in the top-right corner changes it
  } catch {
    data = defaultData();
  }
  loaded = true;
  emit();
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;
function persist() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    AsyncStorage.setItem(KEY, JSON.stringify(data)).catch(() => {});
  }, 150);
}
export async function flush() {
  if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
  await AsyncStorage.setItem(KEY, JSON.stringify(data)).catch(() => {});
}

function emit() {
  version++;
  listeners.forEach((l) => l());
}

export const getData = () => data;
export const isLoaded = () => loaded;

/** Mutate the data in place, then persist and re-render. */
export function update(fn: (d: AppData) => void) {
  fn(data);
  data = { ...data };
  persist();
  emit();
}

export function replaceData(d: AppData) {
  data = d;
  persist();
  emit();
}

export async function deleteAll() {
  data = { ...defaultData(), onboarded: true, settings: { ...defaultData().settings, lang: data.settings.lang, voiceLang: data.settings.voiceLang } };
  await AsyncStorage.clear().catch(() => {});
  await flush();
  emit();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useData(): AppData {
  useSyncExternalStore(subscribe, () => version, () => version);
  return data;
}

export type T = (k: keyof Strings, vars?: Record<string, string | number>) => string;

export function translate(lang: Lang, k: keyof Strings, vars?: Record<string, string | number>): string {
  let s = STRINGS[lang][k] as unknown as string;
  if (typeof s !== 'string') s = String(k);
  if (vars) for (const v in vars) s = s.split('{' + v + '}').join(String(vars[v]));
  return s;
}

/** UI strings in the app language */
export function useT(): { t: T; L: Strings; lang: Lang } {
  const d = useData();
  const lang = d.settings.lang;
  return { t: (k, v) => translate(lang, k, v), L: STRINGS[lang], lang };
}
