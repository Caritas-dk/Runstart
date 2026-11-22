import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useData, useT, update } from '../../store/store';
import { PROGRAMS, getProgram, isFinalSession, segmentsTotal, sessionSegments, sessionSpec, totalSessions } from '../../core/programs';
import { buildSchedule, completedKeys, nextSession } from '../../core/schedule';
import { daysBetween, todayIso } from '../../core/dates';
import { clock } from '../../core/format';
import type { ProgramId } from '../../core/types';
import { Badge, Button, Card, Chip, IntervalBar, Progress, Screen, Section, Sheet, T, s } from '../../ui/components';
import { Calendar } from '../../ui/Calendar';
import { fmtDate, sessSummary } from '../../ui/helpers';
import { ProgramCard } from '../../ui/ProgramCard';
import { TotalKmCard } from '../../ui/TotalKmCard';
import { C, F } from '../../ui/theme';

export default function Home() {
  const d = useData();
  const { t, L, lang } = useT();
  const [moving, setMoving] = useState<{ w: number; s: number; date: string } | null>(null);
  const pid = d.active;
  const ps = pid ? d.programs[pid] : undefined;

  if (!pid || !ps) {
    return (
      <Screen title={t('appName')}>
        {d.history.length ? <TotalKmCard /> : null}
        <T style={{ fontFamily: F.display, fontSize: 40, lineHeight: 42, textTransform: 'uppercase' }}>{t('welcome_title')}</T>
        <T style={[s.muted, { marginTop: 10, marginBottom: 6, lineHeight: 22 }]}>{t('welcome_text')}</T>
        <Section title={t('choose_program')} />
        {PROGRAMS.map((p) => <ProgramCard key={p.id} pid={p.id} />)}
        <T style={[s.xs, { textAlign: 'center', marginTop: 8 }]}>{t('privacy')}</T>
      </Screen>
    );
  }

  const prog = getProgram(pid);
  const total = totalSessions(pid);
  const done = completedKeys(d.history, pid).size;
  const sch = buildSchedule(pid, ps);
  const next = nextSession(pid, ps);
  const upcoming = sch.filter((x) => !(next && x.w === next.w && x.s === next.s)).slice(0, 6);
  const end = sch.length ? sch[sch.length - 1].date : todayIso();

  return (
    <Screen title={t('appName')}>
      <TotalKmCard />
      <Card>
        <View style={[s.row, s.between]}>
          <View style={{ flex: 1 }}>
            <T style={[s.xs, { fontFamily: F.bold, textTransform: 'uppercase', letterSpacing: 0.6 }]}>{t('active_program')}</T>
            <T style={[s.h2, { marginTop: 2 }]}>{t(pid)}</T>
          </View>
          <Chip title={t('nav_programs')} onPress={() => router.push('/programs')} />
        </View>
        <View style={[s.row, s.between, { marginTop: 12, marginBottom: 6 }]}>
          <T style={[s.small, s.muted]}>{t('progress')}</T>
          <T style={s.small}><T style={{ fontFamily: F.bold }}>{done}</T> {t('of')} {total} {t('sessions')}</T>
        </View>
        <Progress value={done / total} />
        {ps.goalDate ? (
          <View style={{ marginTop: 12 }}>
            <T style={[s.small, { fontFamily: F.bold }]}>{daysBetween(todayIso(), ps.goalDate) >= 0 ? t('goal_in', { n: daysBetween(todayIso(), ps.goalDate) }) : fmtDate(ps.goalDate, L, lang)}</T>
            {!ps.finished ? <T style={[s.xs, { marginTop: 2 }]}>{end <= ps.goalDate ? t('goal_ok', { d: fmtDate(end, L, lang) }) : t('goal_late', { d: fmtDate(end, L, lang) })}</T> : null}
          </View>
        ) : null}
      </Card>

      {ps.finished || !next ? (
        <Card lime>
          <T style={[s.h2, { color: C.black }]}>{t('program_done')}</T>
          <T style={{ color: 'rgba(0,0,0,0.6)', marginVertical: 8 }}>{prog.goal}</T>
          <Button kind="navy" title={t('choose_any')} onPress={() => router.push({ pathname: '/setup', params: { pid, mode: 'pos' } })} />
        </Card>
      ) : (
        <Card lime>
          <View style={[s.row, s.between]}>
            <T style={{ color: C.black, fontSize: 12, fontFamily: F.bold, textTransform: 'uppercase', letterSpacing: 0.6, flexShrink: 1 }}>{t('next_session')} · {fmtDate(next.date, L, lang)}</T>
            {isFinalSession(pid, next.w, next.s) ? <Badge title={t('goal_session', { g: prog.goal })} kind="white" /> : null}
          </View>
          <T style={{ fontFamily: F.display, fontSize: 32, color: C.black, textTransform: 'uppercase', marginTop: 6 }}>{t('week')} {next.w + 1} · {t('session')} {next.s + 1}</T>
          <T style={{ color: C.black, fontFamily: F.semibold, fontSize: 14 }}>{sessSummary(sessionSpec(pid, next.w, next.s), t, lang)}</T>
          <T style={{ color: 'rgba(0,0,0,0.6)', fontSize: 14, marginTop: 2, marginBottom: 12 }}>{t('planned')}: <T style={{ color: C.black, fontFamily: F.bold, fontSize: 14 }}>{clock(segmentsTotal(sessionSegments(pid, next.w, next.s)))}</T></T>
          <IntervalBar segs={sessionSegments(pid, next.w, next.s)} onLime />
          <Button kind="navy" style={{ marginTop: 14 }} title={t('start_session')} onPress={() => router.push({ pathname: '/session', params: { pid, w: String(next.w), s: String(next.s) } })} />
        </Card>
      )}

      {!ps.finished ? (
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button small kind="dark" style={{ flex: 1 }} title={t('change_session')} onPress={() => router.push({ pathname: '/setup', params: { pid, mode: 'pos' } })} />
          <Button small kind="dark" style={{ flex: 1 }} title={t('training_days')} onPress={() => router.push({ pathname: '/setup', params: { pid, mode: 'pos' } })} />
        </View>
      ) : null}

      {upcoming.length ? <Section title={t('upcoming')} /> : null}
      {upcoming.length ? (
        <Card style={{ paddingVertical: 4 }}>
          {upcoming.map((x, i) => (
            <View key={x.w + '-' + x.s} style={[s.row, { paddingVertical: 11 }, i > 0 && { borderTopWidth: 1, borderTopColor: C.line }]}>
              <Pressable onPress={() => router.push({ pathname: '/session', params: { pid, w: String(x.w), s: String(x.s) } })} style={[s.row, { flex: 1 }]}>
                <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: C.navy3, alignItems: 'center', justifyContent: 'center' }}>
                  <T style={{ fontFamily: F.displayBold, fontSize: 16 }}>{x.w + 1}.{x.s + 1}</T>
                </View>
                <View style={{ flex: 1 }}>
                  <T style={{ fontFamily: F.bold }}>{fmtDate(x.date, L, lang)}</T>
                  <T style={s.xs}>{t('week')} {x.w + 1}, {t('session').toLowerCase()} {x.s + 1} · {clock(segmentsTotal(sessionSegments(pid, x.w, x.s)))}</T>
                </View>
              </Pressable>
              <Chip title={t('move')} onPress={() => setMoving(x)} />
            </View>
          ))}
        </Card>
      ) : null}

      <Sheet visible={!!moving} onClose={() => setMoving(null)} title={t('move_title')}
        text={moving ? `${t('week')} ${moving.w + 1} · ${t('session')} ${moving.s + 1}` : ''}>
        {moving ? (
          <Calendar value={moving.date} min={todayIso()} highlightDays={ps.days} onChange={(iso) => {
            const m = moving;
            update((x) => { const p = x.programs[pid as ProgramId]!; p.moved = { ...p.moved, [m.w + '-' + m.s]: iso }; });
            setMoving(null);
          }} />
        ) : null}
        <Button kind="ghost" title={t('cancel')} onPress={() => setMoving(null)} />
      </Sheet>
    </Screen>
  );
}

