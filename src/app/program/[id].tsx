import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { buildSegments, getProgram, isFinalSession, segmentsTotal } from '../../core/programs';
import { completedKeys } from '../../core/schedule';
import { clock } from '../../core/format';
import type { ProgramId } from '../../core/types';
import { update, useData, useT } from '../../store/store';
import { Badge, Button, Icon, IntervalBar, Legend, Screen, Stat, T, s } from '../../ui/components';
import { sessSummary } from '../../ui/helpers';
import { C, F } from '../../ui/theme';

export default function ProgramDetail() {
  const { id } = useLocalSearchParams<{ id: ProgramId }>();
  const d = useData();
  const { t, lang } = useT();
  const p = getProgram(id);
  const ps = d.programs[p.id];
  const doneSet = completedKeys(d.history, p.id);
  const [open, setOpen] = useState<Record<number, boolean>>({});
  const isOpen = (wi: number) => open[wi] ?? (ps ? ps.pos.w === wi && !ps.finished : wi === 0);

  return (
    <Screen back title={t(p.id)}>
      <T style={[s.small, s.muted, { marginBottom: 12, lineHeight: 20 }]}>{t((p.id + 'd') as 'p5d')}</T>
      <View style={s.grid2}>
        <Stat value={String(p.weeks.length)} label={t('weeks_lbl')} />
        <Stat value={String(p.weeks.length * 3)} label={t('sessions')} />
        <Stat value={p.km} label="km" />
      </View>
      {!ps ? <Button style={{ marginVertical: 8 }} title={t('start_program')} onPress={() => router.push({ pathname: '/setup', params: { pid: p.id, mode: 'new' } })} /> : null}
      {ps && d.active !== p.id ? <Button style={{ marginVertical: 8 }} title={t('switch_program')} onPress={() => { update((x) => { x.active = p.id; }); router.navigate('/'); }} /> : null}
      <View style={{ marginVertical: 12 }}><Legend /></View>
      {p.weeks.map((wk, wi) => {
        const wdone = [0, 1, 2].filter((si) => doneSet.has(wi + '-' + si)).length;
        const here = ps && !ps.finished && ps.pos.w === wi;
        return (
          <View key={wi} style={{ backgroundColor: C.navy2, borderRadius: 14, marginBottom: 8, overflow: 'hidden' }}>
            <Pressable accessibilityRole="button" onPress={() => setOpen({ ...open, [wi]: !isOpen(wi) })} style={[s.row, s.between, { padding: 15 }]}>
              <View style={s.row}>
                <T style={{ fontFamily: F.bold }}>{t('week')} {wi + 1}</T>
                {here ? <Badge title={t('current_pos')} kind="lime" /> : null}
              </View>
              <View style={s.row}>
                {wdone ? <T style={s.xs}>{wdone}/3 ✓</T> : null}
                <Icon name={isOpen(wi) ? 'down' : 'chev'} size={18} color={C.muted} />
              </View>
            </Pressable>
            {isOpen(wi) ? (
              <View style={{ paddingHorizontal: 16, paddingBottom: 10 }}>
                {wk.map((spec, si) => {
                  const segs = buildSegments(spec);
                  return (
                    <Pressable key={si} accessibilityRole="button" onPress={() => router.push({ pathname: '/session', params: { pid: p.id, w: String(wi), s: String(si) } })}
                      style={{ paddingVertical: 11, borderTopWidth: 1, borderTopColor: C.line }}>
                      <View style={[s.row, s.between]}>
                        <T style={{ fontFamily: F.bold, flexShrink: 1 }}>{doneSet.has(wi + '-' + si) ? '✓ ' : ''}{t('session')} {si + 1}{isFinalSession(p.id, wi, si) ? ' · ' + t('goal_session', { g: p.goal }) : ''}</T>
                        <T style={[s.small, s.muted]}>{clock(segmentsTotal(segs))}</T>
                      </View>
                      <T style={[s.xs, { marginTop: 3, marginBottom: 8 }]}>{sessSummary(spec, t, lang)}</T>
                      <IntervalBar segs={segs} />
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </View>
        );
      })}
    </Screen>
  );
}
