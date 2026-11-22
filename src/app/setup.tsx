import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { getProgram, segmentsTotal, sessionSegments, sessionSpec } from '../core/programs';
import { newProgramState } from '../core/schedule';
import { todayIso } from '../core/dates';
import { clock } from '../core/format';
import type { ProgramId } from '../core/types';
import { update, useData, useT } from '../store/store';
import { Button, Card, Chip, Screen, Section, T, s } from '../ui/components';
import { Calendar } from '../ui/Calendar';
import { fmtDate, sessSummary } from '../ui/helpers';
import { C, F } from '../ui/theme';

/** Start a program, or change position / training days / dates of the active one. */
export default function Setup() {
  const { pid, mode } = useLocalSearchParams<{ pid: ProgramId; mode: 'new' | 'pos' }>();
  const d = useData();
  const { t, L, lang } = useT();
  const p = getProgram(pid);
  const ps = d.programs[pid];
  const today = todayIso();
  const [w, setW] = useState(ps && !ps.finished ? ps.pos.w : 0);
  const [si, setS] = useState(ps && !ps.finished ? ps.pos.s : 0);
  const [days, setDays] = useState<number[]>(ps ? ps.days.slice() : [0, 2, 4]);
  const [start, setStart] = useState(ps && ps.startDate > today ? ps.startDate : today);
  const [goal, setGoal] = useState(ps?.goalDate ?? '');
  const [cal, setCal] = useState<'start' | 'goal' | null>(null);

  const toggleDay = (i: number) => setDays((cur) => cur.includes(i) ? cur.filter((x) => x !== i) : [...(cur.length >= 3 ? cur.slice(1) : cur), i]);

  const save = () => {
    if (days.length !== 3) return;
    update((x) => {
      const old = x.programs[pid];
      const moved = old && old.pos.w === w && old.pos.s === si ? old.moved : {};
      x.programs[pid] = { ...newProgramState(w, si, days, start, goal), moved };
      x.active = pid;
    });
    router.dismissTo('/');
  };

  return (
    <Screen back title={mode === 'new' ? t('start_program') : t(pid)}
      footer={<Button title={mode === 'new' ? t('start_program') : t('save')} disabled={days.length !== 3} onPress={save} />}>
      <T style={[s.small, s.muted, { marginBottom: 6, marginTop: -4 }]}>{t(pid)} · {t('weeks', { n: p.weeks.length })}</T>

      <Section title={t('start_at')} />
      <Card>
        <T style={[s.xs, { marginBottom: 8 }]}>{t('week')}</T>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {p.weeks.map((_, i) => <Chip key={i} title={String(i + 1)} on={w === i} onPress={() => setW(i)} />)}
        </View>
        <T style={[s.xs, { marginTop: 14, marginBottom: 8 }]}>{t('session')}</T>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {[0, 1, 2].map((i) => <Chip key={i} title={`${t('session')} ${i + 1}`} on={si === i} onPress={() => setS(i)} />)}
        </View>
        <T style={[s.xs, { marginTop: 12 }]}>{sessSummary(sessionSpec(pid, w, si), t, lang)} · {clock(segmentsTotal(sessionSegments(pid, w, si)))}</T>
      </Card>

      <Section title={`${t('training_days')} – ${t('pick3')}`} />
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {L.days.map((dn, i) => (
          <Pressable key={i} accessibilityRole="checkbox" accessibilityState={{ checked: days.includes(i) }} onPress={() => toggleDay(i)}
            style={{ flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', backgroundColor: days.includes(i) ? C.lime : C.deep }}>
            <T style={{ fontFamily: F.bold, fontSize: 13, color: days.includes(i) ? C.black : C.white }}>{dn}</T>
          </Pressable>
        ))}
      </View>

      <Section title={t('start_date')} />
      <Pressable onPress={() => setCal(cal === 'start' ? null : 'start')} style={{ backgroundColor: C.deep, borderRadius: 12, padding: 14, borderWidth: 1.5, borderColor: C.line }}>
        <T style={{ fontFamily: F.semibold }}>{fmtDate(start, L, lang)}</T>
      </Pressable>
      {cal === 'start' ? <Card style={{ marginTop: 8 }}><Calendar value={start} min={today} highlightDays={days} onChange={(v) => { setStart(v); setCal(null); }} /></Card> : null}

      <Section title={t('goal_date')} />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Pressable onPress={() => setCal(cal === 'goal' ? null : 'goal')} style={{ flex: 1, backgroundColor: C.deep, borderRadius: 12, padding: 14, borderWidth: 1.5, borderColor: C.line }}>
          <T style={{ fontFamily: F.semibold, color: goal ? C.white : C.muted }}>{goal ? fmtDate(goal, L, lang) : t('no_goal')}</T>
        </Pressable>
        {goal ? <Button small kind="ghost" title="✕" onPress={() => setGoal('')} /> : null}
      </View>
      {cal === 'goal' ? <Card style={{ marginTop: 8 }}><Calendar value={goal || start} min={start} onChange={(v) => { setGoal(v); setCal(null); }} /></Card> : null}
    </Screen>
  );
}
