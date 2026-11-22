import React from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useData, useT } from '../store/store';
import { getProgram, totalSessions } from '../core/programs';
import { completedKeys } from '../core/schedule';
import type { ProgramId } from '../core/types';
import { Badge, T, s } from './components';
import { C, F } from './theme';

export function ProgramCard({ pid }: { pid: ProgramId }) {
  const d = useData();
  const { t } = useT();
  const p = getProgram(pid);
  const ps = d.programs[pid];
  const done = completedKeys(d.history, pid).size, tot = totalSessions(pid);
  return (
    <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/program/[id]', params: { id: pid } })}
      style={({ pressed }) => ({ backgroundColor: C.navy2, borderRadius: 18, padding: 18, marginBottom: 12, opacity: pressed ? 0.85 : 1, overflow: 'hidden' })}>
      <View style={{ position: 'absolute', right: -30, top: -30, width: 120, height: 120, borderRadius: 60, borderWidth: 14, borderColor: 'rgba(182,242,58,0.12)' }} />
      <View style={[s.row, s.between]}>
        <T style={{ fontFamily: F.display, fontSize: 46, color: C.lime, lineHeight: 50 }}>{p.km}<T style={{ fontFamily: F.display, fontSize: 22, color: C.lime }}> km</T></T>
        {ps ? <Badge title={d.active === pid ? t('active_program') : t('in_progress')} kind={d.active === pid ? 'lime' : 'default'} /> : null}
      </View>
      <T style={[s.h3, { marginTop: 6 }]}>{t(pid)} · {t('weeks', { n: p.weeks.length })}</T>
      <T style={[s.small, s.muted, { marginTop: 4, lineHeight: 19 }]}>{t((pid + 'd') as 'p5d')}</T>
      <T style={[s.xs, { marginTop: 10 }]}>{t('per_week')} · {tot} {t('sessions')}{ps ? ` · ${done}/${tot} ✓` : ''}</T>
    </Pressable>
  );
}
