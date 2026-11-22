export type ProgramId = 'p5' | 'p10' | 'phm';
export type Env = 'treadmill' | 'outdoor';
export type Rating = 'easy' | 'right' | 'hard';
export type Lang = 'da' | 'en' | 'fr' | 'de' | 'es';
export type VoiceAmount = 'full' | 'basic' | 'off';

/** [repetitions, run seconds, walk seconds between runs] */
export type SessionSpec = [number, number, number];

export type SegmentType = 'run' | 'walk';
export interface Segment {
  type: SegmentType;
  dur: number; // seconds
  role?: 'warm' | 'cool';
  /** inserted by the runner (extra walk break) – not part of the plan */
  extra?: boolean;
  /** remainder of a run that was split by an extra walk break */
  resumed?: boolean;
}

export interface Pos { w: number; s: number }

export interface ProgramState {
  pos: Pos;
  /** weekdays 0=Mon … 6=Sun, exactly 3 */
  days: number[];
  startDate: string; // yyyy-mm-dd
  goalDate: string; // '' when none
  /** session key "w-s" -> yyyy-mm-dd */
  moved: Record<string, string>;
  finished: boolean;
}

export interface WorkoutRecord {
  id: string;
  pid: ProgramId;
  w: number;
  s: number;
  env: Env;
  date: string; // ISO timestamp of start
  completed: boolean;
  completion: number; // 0..1 of planned time
  total: number; // seconds incl. pauses
  active: number; // seconds excl. pauses
  run: number;
  walk: number;
  pause: number;
  longest: number; // longest continuous run, seconds
  repeat: boolean;
  rating: Rating | null;
  dist?: number; // km: GPS outdoors, or typed in from the treadmill display afterwards
  distSource?: 'gps' | 'manual';
}

export interface Settings {
  lang: Lang;
  voiceLang: Lang;
  voiceAmount: VoiceAmount;
  volume: number; // 0..1
  vibration: boolean;
  countdown: 0 | 3 | 5;
  kmVoice: boolean;
  reminders: boolean;
  reminderTime: string; // HH:MM
}

export interface AppData {
  settings: Settings;
  active: ProgramId | null;
  programs: Partial<Record<ProgramId, ProgramState>>;
  history: WorkoutRecord[];
  /** true once the user has picked a language on first launch */
  onboarded: boolean;
}
