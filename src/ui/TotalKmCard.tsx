import React from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { MILESTONES, achievedIds, nextTotalMilestone, totalKm } from '../core/milestones';
import { km } from '../core/format';
import { useData, useT } from '../store/store';
import { milestoneText } from '../i18n/milestones';
import { Icon, Progress, T, s } from './components';
import { C, F } from './theme';

/** Start-screen card: total km run with the app, next distance milestone and milestone count. */
export function TotalKmCard() {
  const d = useData();
  const { t, lang } = useT();
  const total = totalKm(d.history);
  const next = nextTotalMilestone(d.history);
  const count = achievedIds(d.history).length;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={t('milestones')} onPress={() => router.push('/milestones')}
      style={({ pressed }) => ({ backgroundColor: C.navy2, borderRadius: 16, padding: 16, marginBottom: 12, opacity: pressed ? 0.85 : 1 })}>
      <View style={[s.row, s.between]}>
        <T style={[s.xs, { fontFamily: F.bold, textTransform: 'uppercase', letterSpacing: 0.6 }]}>{t('total_km')}</T>
        <View style={s.row}>
          <T style={[s.xs, { color: C.lime, fontFamily: F.semibold }]}>{t('milestones_count', { a: count, b: MILESTONES.length })}</T>
          <Icon name="chev" size={16} color={C.muted} />
        </View>
      </View>
      <T style={{ fontFamily: F.display, fontSize: 48, lineHeight: 52, color: C.lime, marginTop: 2 }}>
        {km(total, lang)}<T style={{ fontFamily: F.display, fontSize: 22, color: C.lime }}> km</T>
      </T>
      {next ? (
        <View style={{ marginTop: 6 }}>
          <T style={[s.xs, { marginBottom: 6 }]}>{t('next_milestone', { m: milestoneText(lang, next.m.id)[0], n: km(next.left, lang) })}</T>
          <Progress value={total / next.m.value} />
        </View>
      ) : null}
      <T style={[s.xs, { marginTop: 8, fontSize: 11 }]}>{t('total_km_note')}</T>
    </Pressable>
  );
}
