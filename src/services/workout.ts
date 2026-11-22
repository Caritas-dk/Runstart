import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import { useSyncExternalStore } from 'react';
import { createEngine, snapshot, pause as ePause, resume as eResume, addExtraWalk, runIntervalInfo, isPaused, type EngineState, type Snapshot } from '../core/engine';
import { cuesBetween, type Cue } from '../core/cues';
import { addPoint, newTrack, takeKmMilestone, avgPace, type GpsTrack } from '../core/gps';
import { getProgram, sessionSegments } from '../core/programs';
import { applyWorkoutToProgram } from '../core/schedule';
import { headlineMilestone, newMilestones } from '../core/milestones';
import { milestoneText } from '../i18n/milestones';
import { shortDur } from '../core/format';
import type { Env, Lang, ProgramId, Segment, WorkoutRecord } from '../core/types';
import { getData, update, translate, flush } from '../store/store';
import * as audio from './audio';
import * as loc from './location';
import * as clock from './clock';

export type GpsStatus = 'off' | 'waiting' | 'ok' | 'unavailable';

export interface LiveWorkout {
  pid: ProgramId; w: number; s: number; env: Env;
  engine: EngineState;
  track: GpsTrack;
  gps: GpsStatus;
  isRepeat: boolean;
  startedIso: string;
  snap: Snapshot;
}

export interface FinishedResult { id: string; advanced: null | 'done' | { w: number; s: number }; milestones: string[] }

const ACTIVE_KEY = 'runstart/active-workout/v1';
let live: LiveWorkout | null = null;
let lastResult: FinishedResult | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let ver = 0;
const subs = new Set<() => void>();
const emit = () => { ver++; subs.forEach((f) => f()); };
let lastPersist = 0;
let finishing = false;

export const getLive = () => live;
export const getLastResult = () => lastResult;

export function useLiveWorkout(): LiveWorkout | null {
  useSyncExternalStore((l) => { subs.add(l); return () => subs.delete(l); }, () => ver, () => ver);
  return live;
}

/* ---------- voice text ---------- */
const vt = (k: Parameters<typeof translate>[1], v?: Record<string, string | number>) => translate(getData().settings.voiceLang, k, v);

function spokenDur(sec: number): string {
  sec = Math.round(sec);
  const m = Math.floor(sec / 60), s = sec % 60;
  const p: string[] = [];
  if (m) p.push(m + ' ' + (m === 1 ? vt('v_minute') : vt('v_minutes')));
  if (s) p.push(s + ' ' + (s === 1 ? vt('v_second') : vt('v_seconds')));
  return p.join(' ' + vt('v_and') + ' ');
}

function spokenPace(minPerKm: number): string {
  const total = Math.round(minPerKm * 60);
  return spokenDur(total);
}

function segmentPhrase(seg: Segment): string {
  if (seg.role === 'warm') return vt('v_warm', { d: spokenDur(seg.dur) });
  if (seg.role === 'cool') return vt('v_cool', { d: spokenDur(seg.dur) });
  if (seg.extra) return vt('v_extra');
  return vt(seg.type === 'run' ? 'v_run' : 'v_walk', { d: spokenDur(seg.dur) });
}

function nextPhrase(seg: Segment): string {
  if (seg.role === 'cool') return vt('v_next_cool');
  return vt(seg.type === 'run' ? 'v_next_run' : 'v_next_walk', { d: spokenDur(seg.dur) });
}

function say(text: string, force = false) {
  const st = getData().settings;
  if (!force && st.voiceAmount === 'off') return;
  if (clock.getSpeed() > 1) audio.stopSpeech();
  audio.speak(text, st.voiceLang, st.volume);
}

function statusTitle(l: LiveWorkout, lang: Lang) {
  const seg = l.snap.seg;
  const label = seg.role === 'warm' ? translate(lang, 'warmup') : seg.role === 'cool' ? translate(lang, 'cooldown') : translate(lang, seg.type);
  return `${label} · ${shortDur(seg.dur, lang)}`;
}
function statusArtist(l: LiveWorkout, lang: Lang) {
  return `${translate(lang, l.pid)} · ${translate(lang, 'week')} ${l.w + 1} · ${translate(lang, 'session')} ${l.s + 1}`;
}

function announceSegment(l: LiveWorkout) {
  const st = getData().settings;
  const seg = l.engine.segments[l.snap.idx];
  audio.tone(seg.type === 'run' ? 'run' : 'walk', st.volume);
  audio.vibrate(st.vibration, seg.type === 'run' ? [0, 300, 150, 300] : [0, 600]);
  let text = segmentPhrase(seg);
  if (st.voiceAmount === 'full' && seg.type === 'run' && !seg.resumed) {
    const info = runIntervalInfo(l.engine, l.snap.idx);
    if (info.of > 1 && info.n === info.of) text = vt('v_last') + ' ' + text;
  }
  say(text);
  audio.updateSessionStatus(statusTitle(l, st.lang), statusArtist(l, st.lang));
}

function handleCue(l: LiveWorkout, c: Cue) {
  const st = getData().settings;
  switch (c.kind) {
    case 'segment': announceSegment(l); break;
    case 'half': say(vt('v_half')); break;
    case 'next': { const nx = l.engine.segments[c.idx]; if (nx) say(vt('v_next', { x: nextPhrase(nx) })); break; }
    case 'countdown': audio.tone('count', st.volume); break;
    case 'done': break;
  }
}

/* ---------- lifecycle ---------- */
async function persistLive(force = false) {
  if (!live) return;
  const now = clock.now();
  if (!force && now - lastPersist < 5000) return;
  lastPersist = now;
  const { pid, w, s, env, engine, track, isRepeat, startedIso } = live;
  await AsyncStorage.setItem(ACTIVE_KEY, JSON.stringify({ pid, w, s, env, engine, track, isRepeat, startedIso, savedAt: now })).catch(() => {});
}

let simLast = 0;
let simLat = 55.6761;
/** Browser demo only: fake GPS points at a realistic run/walk speed. */
function simulateGps(l: LiveWorkout, now: number, snap: Snapshot) {
  if (!simLast) simLast = now;
  const dt = (now - simLast) / 1000;
  if (dt < 1) return;
  simLast = now;
  const kmh = snap.paused ? 0 : (snap.seg.type === 'run' ? 9.4 : 5.6) + (Math.random() - 0.5) * 0.8;
  simLat += (kmh / 3600) * dt / 111.32;
  onPoint({ lat: simLat, lon: 12.5683, t: now, acc: 5, speed: kmh / 3.6 });
}

function tick() {
  if (!live) return;
  const now = clock.now();
  const prev = live.snap;
  const snap = snapshot(live.engine, now);
  live.snap = snap;
  if (clock.DEMO && live.env === 'outdoor' && live.gps !== 'unavailable') simulateGps(live, now, snap);
  const next = live.engine.segments[snap.idx + 1];
  const st = getData().settings;
  for (const c of cuesBetween(prev, snap, { voiceAmount: st.voiceAmount, countdown: st.countdown }, next?.dur)) handleCue(live, c);
  if (snap.done) { void finish(true); return; }
  persistLive();
  emit();
}

function onPoint(p: { lat: number; lon: number; t: number; acc?: number | null; speed?: number | null }) {
  if (!live || live.env !== 'outdoor') return;
  if (live.gps === 'waiting') live.gps = 'ok';
  addPoint(live.track, p, isPaused(live.engine));
  const km = takeKmMilestone(live.track);
  const st = getData().settings;
  if (km && st.kmVoice) {
    const pace = avgPace(snapshot(live.engine, clock.now()).active, live.track.dist);
    say(km === 1 ? vt('v_km_one', { p: spokenPace(pace) }) : vt('v_km', { n: km, p: spokenPace(pace) }));
  }
}

function startTimer() {
  if (timer) clearInterval(timer);
  timer = setInterval(tick, 250);
}

let appStateSub: { remove: () => void } | null = null;
function watchAppState() {
  appStateSub?.remove();
  // when coming back to the foreground, recompute immediately (timestamps make this exact)
  appStateSub = AppState.addEventListener('change', (s) => { if (s === 'active') tick(); });
}

export async function startWorkout(pid: ProgramId, w: number, s: number, env: Env, gpsAllowed: boolean) {
  const d = getData();
  const ps = d.programs[pid];
  const now = clock.now();
  const engine = createEngine(sessionSegments(pid, w, s), now);
  live = {
    pid, w, s, env, engine, track: newTrack(),
    gps: env === 'outdoor' ? (gpsAllowed ? 'waiting' : 'unavailable') : 'off',
    isRepeat: !ps || ps.pos.w !== w || ps.pos.s !== s,
    startedIso: new Date(now).toISOString(),
    snap: snapshot(engine, now),
  };
  lastResult = null;
  const lang = d.settings.lang;
  await audio.startSession(statusTitle(live, lang), statusArtist(live, lang));
  if (env === 'outdoor' && clock.DEMO) {
    simLast = 0;
    live.gps = 'waiting';
  } else if (env === 'outdoor' && gpsAllowed) {
    const ok = await loc.startTracking(onPoint, translate(lang, 'appName'), statusArtist(live, lang));
    if (!ok && live) live.gps = 'unavailable';
  }
  if (!live) return;
  announceSegment(live);
  startTimer();
  watchAppState();
  await persistLive(true);
  emit();
}

export function togglePause() {
  if (!live) return;
  const now = clock.now();
  const st = getData().settings;
  if (isPaused(live.engine)) { eResume(live.engine, now); say(vt('v_resume')); }
  else { ePause(live.engine, now); say(vt('v_pause')); }
  audio.vibrate(st.vibration, 150);
  live.snap = snapshot(live.engine, now);
  void persistLive(true);
  emit();
}

export function extraWalk() {
  if (!live) return;
  const now = clock.now();
  if (addExtraWalk(live.engine, now)) {
    live.snap = snapshot(live.engine, now);
    announceSegment(live);
    void persistLive(true);
    emit();
  }
}

export async function stopWorkout() { await finish(false); }

async function finish(completed: boolean) {
  if (!live || finishing) return;
  finishing = true;
  const l = live;
  if (timer) { clearInterval(timer); timer = null; }
  appStateSub?.remove(); appStateSub = null;
  const snap = snapshot(l.engine, clock.now());
  const rec: WorkoutRecord = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    pid: l.pid, w: l.w, s: l.s, env: l.env, date: l.startedIso,
    completed, completion: completed ? 1 : Math.min(1, snap.plannedDone / l.engine.planned),
    total: Math.round(snap.total), active: Math.round(snap.active), run: Math.round(snap.run), walk: Math.round(snap.walk),
    pause: Math.round(snap.pause), longest: Math.round(snap.longest), repeat: l.isRepeat, rating: null,
  };
  if (l.env === 'outdoor' && l.gps !== 'unavailable') { rec.dist = Math.round(l.track.dist * 1000) / 1000; rec.distSource = 'gps'; }
  let advanced: FinishedResult['advanced'] = null;
  const before = getData().history.slice();
  update((d) => {
    d.history.push(rec);
    advanced = applyWorkoutToProgram(d, rec).advanced;
  });
  const reached = newMilestones(before, getData().history);
  lastResult = { id: rec.id, advanced, milestones: reached.map((m) => m.id) };
  live = null;
  finishing = false;
  await flush();
  const st = getData().settings;
  if (completed) { audio.tone('done', st.volume); audio.vibrate(st.vibration, [0, 200, 100, 200, 100, 400]); }
  say(completed ? vt('v_done') : vt('v_stop'));
  const top = headlineMilestone(reached);
  if (top) say(milestoneText(st.voiceLang, top.id)[1]);
  await loc.stopTracking();
  // let the last phrase finish before the audio session is released
  setTimeout(() => { if (!live) void audio.endSession(); }, 12000);
  await AsyncStorage.removeItem(ACTIVE_KEY).catch(() => {});
  emit();
}

/* ---------- recovery after the app was closed mid-workout ---------- */
interface Saved { pid: ProgramId; w: number; s: number; env: Env; engine: EngineState; track: GpsTrack; isRepeat: boolean; startedIso: string; savedAt: number }

export async function getInterrupted(): Promise<Saved | null> {
  try {
    const raw = await AsyncStorage.getItem(ACTIVE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Saved;
    if (!s.engine || !Array.isArray(s.engine.segments)) return null;
    return s;
  } catch { return null; }
}

/** The time the app was closed counts as a pause, so the interval is frozen where it stopped. */
function restore(s: Saved): LiveWorkout {
  const now = clock.now();
  const engine = s.engine;
  if (!isPaused(engine)) engine.pauses.push({ start: s.savedAt, end: now });
  return { pid: s.pid, w: s.w, s: s.s, env: s.env, engine, track: s.track, gps: s.env === 'outdoor' ? 'waiting' : 'off', isRepeat: s.isRepeat, startedIso: s.startedIso, snap: snapshot(engine, now) };
}

export async function resumeInterrupted(s: Saved, gpsAllowed: boolean) {
  live = restore(s);
  const lang = getData().settings.lang;
  await audio.startSession(statusTitle(live, lang), statusArtist(live, lang));
  if (live.env === 'outdoor') {
    live.track.last = null;
    if (!gpsAllowed || !(await loc.startTracking(onPoint, translate(lang, 'appName'), statusArtist(live, lang)))) { if (live) live.gps = 'unavailable'; }
  }
  if (!live) return;
  announceSegment(live);
  startTimer();
  watchAppState();
  emit();
}

export async function saveInterruptedAsPartial(s: Saved) {
  live = restore(s);
  await finish(false);
}

export async function discardInterrupted() {
  await AsyncStorage.removeItem(ACTIVE_KEY).catch(() => {});
}

export function sessionLabel(lang: Lang, pid: ProgramId) { return translate(lang, pid) + ' · ' + getProgram(pid).goal; }

/* ---------- browser demo controls ---------- */
export function demoSetSpeed(x: number) { clock.setSpeed(x); emit(); }
export function demoSkipInterval() {
  if (!live) return;
  clock.skip(live.snap.segRemaining + 0.05);
  tick();
}
