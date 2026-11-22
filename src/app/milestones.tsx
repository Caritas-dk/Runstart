import React from 'react';
import { View } from 'react-native';
import { CATEGORY_ORDER, MILESTONES, achievedDates, nextTotalMilestone, totalKm } from '../core/milestones';
import { isoDate } from '../core/dates';
import { km } from '../core/format';
import { useData, useT } from '../store/store';
import { milestoneText } from '../i18n/milestones';
import { Card, Progress, Screen, Section, T, s } from '../ui/components';
import { MilestoneBadge } from '../ui/MilestoneBadge';
import { fmtDate } from '../ui/helpers';
import { C, F } from '../ui/theme';

export default function MilestonesScreen() {
  const d = useData();
  const { t, L, lang } = useT();
  const dates = achievedDates(d.history);
  const count = Object.keys(dates).length;
  const total = totalKm(d.history);
  const next = nextTotalMilestone(d.history);

  return (
    <Screen back title={t('milestones')}>
      <Card>
        <T style={[s.xs, { fontFamily: F.bold, textTransform: 'uppercase', letterSpacing: 0.6 }]}>{t('total_km')}</T>
        <T style={{ fontFamily: F.display, fontSize: 52, lineHeight: 56, color: C.lime }}>{km(total, lang)} <T style={{ fontFamily: F.display, fontSize: 24, color: C.lime }}>km</T></T>
        <T style={s.xs}>{t('total_km_note')}</T>
        {next ? (
          <View style={{ marginTop: 12 }}>
            <T style={[s.small, { marginBottom: 6 }]}>{t('next_milestone', { m: milestoneText(lang, next.m.id)[0], n: km(next.left, lang) })}</T>
            <Progress value={total / next.m.value} />
          </View>
        ) : null}
        <T style={[s.small, s.muted, { marginTop: 12 }]}>{t('milestones_count', { a: count, b: MILESTONES.length })}</T>
      </Card>

      {CATEGORY_ORDER.map((cat) => (
        <View key={cat}>
          <Section title={t(('cat_' + cat) as 'cat_total')} />
          <Card style={{ paddingVertical: 4 }}>
            {MILESTONES.filter((m) => m.cat === cat).map((m, i) => {
              const at = dates[m.id];
              const [title, praise] = milestoneText(lang, m.id);
              return (
                <View key={m.id} style={[s.row, { paddingVertical: 12, alignItems: 'flex-start' }, i > 0 && { borderTopWidth: 1, borderTopColor: C.line }]}>
                  <MilestoneBadge m={m} locked={!at} size={52} />
                  <View style={{ flex: 1 }}>
                    <T style={{ fontFamily: F.bold, color: at ? C.white : C.muted }}>{title}</T>
                    <T style={[s.xs, { marginTop: 2, lineHeight: 17 }]}>{at ? praise : t('not_yet')}</T>
                    {at ? <T style={[s.xs, { marginTop: 4, color: C.lime }]}>{t('achieved_on', { d: fmtDate(isoDate(new Date(at)), L, lang) })}</T> : null}
                  </View>
                </View>
              );
            })}
          </Card>
        </View>
      ))}
    </Screen>
  );
}
