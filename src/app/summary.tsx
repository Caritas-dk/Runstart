import React from 'react';
import { BackHandler, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { clock, km, kmh, pace } from '../core/format';
import { avgPace } from '../core/gps';
import type { Rating } from '../core/types';
import { update, useData, useT } from '../store/store';
import { getLastResult } from '../services/workout';
import { Badge, Button, Card, Chip, Progress, Screen, Section, Stat, T, s } from '../ui/components';
import { MILESTONES } from '../core/milestones';
import { milestoneText } from '../i18n/milestones';
import { MilestoneBadge } from '../ui/MilestoneBadge';
import { TreadmillDistance } from '../ui/TreadmillDistance';
import { C, F } from '../ui/theme';

export default function Summary() {
  const d = useData();
  const { t, lang } = useT();
  const res = getLastResult();
  const r = res ? d.history.find((h) => h.id === res.id) : undefined;
  const [extra, setExtra] = React.useState<string[]>([]);

  useFocusEffect(React.useCallback(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => { router.dismissTo('/'); return true; });
    return () => sub.remove();
  }, []));

  if (!r) return <Screen><Button title={t('done_btn')} onPress={() => router.dismissTo('/')} /></Screen>;
  const adv = res!.advanced;
  const setRating = (v: Rating) => update((x) => { const h = x.history.find((y) => y.id === r.id); if (h) h.rating = v; });
  const home = () => router.dismissTo('/');
  const setPos = (w: number) => {
    update((x) => { const ps = x.programs[r.pid]; if (ps) { ps.pos = { w, s: 0 }; ps.finished = false; ps.moved = {}; x.active = r.pid; } });
    home();
  };

  return (
    <Screen right={<Badge title={r.env === 'outdoor' ? t('out_badge') : t('tm_badge')} kind={r.env === 'outdoor' ? 'lime' : 'white'} />}>
      <T style={[s.xs, { fontFamily: F.bold, textTransform: 'uppercase', letterSpacing: 0.6 }]}>{t(r.pid)} · {t('week')} {r.w + 1} · {t('session')} {r.s + 1}</T>
      <T style={{ fontFamily: F.display, fontSize: 40, lineHeight: 44, textTransform: 'uppercase', marginTop: 6, color: r.completed ? C.lime : C.white }}>
        {r.completed ? t('summary_done') : t('summary_partial')}
      </T>
      <T style={[s.small, s.muted, { marginTop: 8, marginBottom: 14 }]}>
        {r.completed ? (adv === 'done' ? t('program_done') : adv ? t('advanced', { w: adv.w + 1, s: adv.s + 1 }) : '') : t('partial_note')}
      </T>

      {[...(res!.milestones || []), ...extra.filter((x) => !(res!.milestones || []).includes(x))].map((id) => {
        const m = MILESTONES.find((x) => x.id === id);
        if (!m) return null;
        const [title, praise] = milestoneText(lang, id);
        return (
          <Card key={id} lime style={[s.row, { alignItems: 'center', gap: 14 }]}>
            <View style={{ backgroundColor: C.navy, borderRadius: 32, padding: 4 }}><MilestoneBadge m={m} size={56} /></View>
            <View style={{ flex: 1 }}>
              <T style={{ color: C.navy, fontFamily: F.bold, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6 }}>{t('new_milestone')}</T>
              <T style={{ color: C.black, fontFamily: F.display, fontSize: 22, textTransform: 'uppercase', lineHeight: 26 }}>{title}</T>
              <T style={{ color: 'rgba(0,0,0,0.75)', fontSize: 13.5, lineHeight: 19, marginTop: 2 }}>{praise}</T>
            </View>
          </Card>
        );
      })}

      <Card>
        <View style={[s.row, s.between]}>
          <T style={[s.muted, s.small]}>{t('total')}</T>
          <T style={{ fontFamily: F.displayBold, fontSize: 36 }}>{clock(r.total)}</T>
        </View>
        <View style={{ marginTop: 10, marginBottom: 4 }}><Progress value={r.completion} /></View>
        <T style={s.xs}>{t('completion')}: {Math.round(r.completion * 100)}%</T>
      </Card>

      {r.env === 'treadmill' ? (
        <Card><TreadmillDistance rec={r} onMilestones={(ms) => setExtra((cur) => [...cur, ...ms.map((m) => m.id)])} /></Card>
      ) : null}

      <View style={s.grid2}><Stat value={clock(r.run)} label={t('run_time')} accent /><Stat value={clock(r.walk)} label={t('walk_time')} /></View>
      <View style={s.grid2}><Stat value={clock(r.pause)} label={t('pause_time')} /><Stat value={clock(r.longest)} label={t('longest')} /></View>
      {r.env === 'outdoor' && r.dist != null ? (
        <>
          <View style={s.grid2}><Stat value={`${km(r.dist, lang)} km`} label={t('distance')} /><Stat value={`${pace(avgPace(r.active, r.dist))} ${t('perkm')}`} label={t('pace_avg')} /></View>
          <View style={s.grid2}><Stat value={r.dist > 0.01 ? kmh(r.dist / (r.active / 3600), lang) : '–'} label={`${t('avg_speed')} (${t('kmh')})`} /><View style={{ flex: 1 }} /></View>
        </>
      ) : null}

      <Section title={t('rate_q')} />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {(['easy', 'right', 'hard'] as Rating[]).map((k) => (
          <View key={k} style={{ flex: 1 }}>
            <Chip title={t(k === 'easy' ? 'too_easy' : k === 'right' ? 'just_right' : 'too_hard')} on={r.rating === k} onPress={() => setRating(k)} />
          </View>
        ))}
      </View>

      <View style={{ gap: 10, marginTop: 22 }}>
        <Button title={t('done_btn')} onPress={home} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button small kind="dark" style={{ flex: 1 }} title={t('repeat_session')} onPress={() => { router.dismissTo('/'); router.push({ pathname: '/session', params: { pid: r.pid, w: String(r.w), s: String(r.s) } }); }} />
          <Button small kind="dark" style={{ flex: 1 }} title={t('repeat_week')} onPress={() => setPos(r.w)} />
        </View>
        {r.w > 0 ? <Button kind="ghost" title={`${t('easier')} · ${t('easier_text')}`} onPress={() => setPos(r.w - 1)} /> : null}
      </View>
    </Screen>
  );
}
