import React, { useState } from 'react';
import { View } from 'react-native';
import { PROGRAMS, totalSessions } from '../../core/programs';
import { programStats, weeklyActivity } from '../../core/stats';
import { clock, km, minutesText } from '../../core/format';
import { isoDate } from '../../core/dates';
import type { ProgramId } from '../../core/types';
import { useData, useT } from '../../store/store';
import { Badge, Button, Card, Chip, Progress, Screen, Section, Sheet, Stat, T, s } from '../../ui/components';
import { TreadmillDistance } from '../../ui/TreadmillDistance';
import { MilestoneBadge } from '../../ui/MilestoneBadge';
import { milestoneText } from '../../i18n/milestones';
import type { Milestone } from '../../core/milestones';
import { WeeklyChart } from '../../ui/WeeklyChart';
import { fmtDate } from '../../ui/helpers';
import { C, F } from '../../ui/theme';

export default function History() {
  const d = useData();
  const { t, L, lang } = useT();
  const [sel, setSel] = useState<ProgramId | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState<Milestone[]>([]);
  const editRec = editId ? d.history.find((h) => h.id === editId) : undefined;
  const pid: ProgramId = sel ?? d.active ?? PROGRAMS.find((p) => d.history.some((h) => h.pid === p.id))?.id ?? 'p5';
  const st = programStats(d.history, pid);
  const tot = totalSessions(pid);
  const weeks = weeklyActivity(st.workouts);
  const rating = { easy: t('too_easy'), right: t('just_right'), hard: t('too_hard') };

  return (
    <Screen title={t('nav_history')}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
        {PROGRAMS.map((p) => <Chip key={p.id} title={t(p.id)} on={p.id === pid} onPress={() => setSel(p.id)} />)}
      </View>
      <Card>
        <View style={[s.row, s.between, { marginBottom: 6 }]}>
          <T style={[s.small, s.muted]}>{t('completed_sessions')}</T>
          <T style={s.small}><T style={{ fontFamily: F.bold }}>{st.completed}</T> / {tot}</T>
        </View>
        <Progress value={st.completed / tot} />
      </Card>
      <View style={s.grid2}><Stat value={minutesText(st.run, lang)} label={t('total_run')} accent /><Stat value={minutesText(st.walk, lang)} label={t('total_walk')} /></View>
      <View style={s.grid2}><Stat value={clock(st.longest)} label={t('longest')} /><Stat value={`${km(st.dist, lang)} km`} label={t('total_km')} /></View>
      <Card>
        <T style={{ fontFamily: F.bold, fontSize: 14, marginBottom: 8 }}>{t('weekly')}</T>
        <WeeklyChart weeks={weeks} />
        <View style={{ flexDirection: 'row', gap: 14, marginTop: 6 }}>
          <View style={s.row}><View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: C.lime }} /><T style={s.xs}>{t('run_lbl')}</T></View>
          <View style={s.row}><View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: C.walkBar }} /><T style={s.xs}>{t('walk_lbl')}</T></View>
        </View>
      </Card>

      <Section title={t('workouts')} />
      {!st.workouts.length ? <Card><T style={[s.small, s.muted]}>{t('no_history')}</T></Card> : (
        <Card style={{ paddingVertical: 4 }}>
          {st.workouts.map((r, i) => (
            <View key={r.id} style={[s.row, { paddingVertical: 11, alignItems: 'flex-start' }, i > 0 && { borderTopWidth: 1, borderTopColor: C.line }]}>
              <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: r.completed ? C.lime : C.white, alignItems: 'center', justifyContent: 'center' }}>
                <T style={{ fontFamily: F.displayBold, fontSize: 16, color: C.black }}>{r.w + 1}.{r.s + 1}</T>
              </View>
              <View style={{ flex: 1 }}>
                <View style={[s.row, { flexWrap: 'wrap', gap: 6 }]}>
                  <T style={{ fontFamily: F.bold }}>{fmtDate(isoDate(new Date(r.date)), L, lang)}</T>
                  <Badge title={r.env === 'outdoor' ? t('out_badge') : t('tm_badge')} />
                  {r.repeat ? <Badge title={t('repeat_tag')} /> : null}
                </View>
                <T style={[s.xs, { marginTop: 3, lineHeight: 17 }]}>
                  {r.completed ? t('status_full') : `${t('status_partial')} ${Math.round(r.completion * 100)}%`} · {clock(r.total)} · {t('run_lbl')} {clock(r.run)} · {t('walk_lbl')} {clock(r.walk)}
                  {r.dist != null ? ` · ${km(r.dist, lang)} km${r.distSource === 'manual' ? ` (${t('manual_tag')})` : ''}` : ''}{r.rating ? ` · ${rating[r.rating]}` : ''}
                </T>
                {r.env === 'treadmill' ? (
                  <View style={{ flexDirection: 'row', marginTop: 8 }}>
                    <Chip title={r.dist != null ? `${t('tm_dist_edit')} km` : t('add_km')} onPress={() => setEditId(r.id)} />
                  </View>
                ) : null}
              </View>
            </View>
          ))}
        </Card>
      )}
      <Sheet visible={!!editRec} onClose={() => setEditId(null)} title={t('tm_dist_title')}>
        {editRec ? <TreadmillDistance key={editRec.id} compact rec={editRec} onMilestones={(ms) => { setEditId(null); setCelebrate(ms); }} /> : null}
        <Button kind="ghost" title={t('close')} onPress={() => setEditId(null)} />
      </Sheet>
      <Sheet visible={celebrate.length > 0} onClose={() => setCelebrate([])} title={t('new_milestone')}>
        {celebrate.map((m) => (
          <View key={m.id} style={[s.row, { alignItems: 'center', gap: 12, marginBottom: 6 }]}>
            <MilestoneBadge m={m} size={52} />
            <View style={{ flex: 1 }}>
              <T style={{ fontFamily: F.bold }}>{milestoneText(lang, m.id)[0]}</T>
              <T style={[s.xs, { lineHeight: 17 }]}>{milestoneText(lang, m.id)[1]}</T>
            </View>
          </View>
        ))}
        <Button title={t('done_btn')} onPress={() => setCelebrate([])} />
      </Sheet>
    </Screen>
  );
}
