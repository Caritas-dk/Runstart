import React, { useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { segmentsRun, segmentsTotal, sessionSegments, sessionSpec } from '../core/programs';
import { clock, shortDur } from '../core/format';
import type { Env, ProgramId } from '../core/types';
import { useData, useT, translate } from '../store/store';
import { ensureLocationPermission, openAppSettings } from '../services/location';
import { startWorkout } from '../services/workout';
import * as audio from '../services/audio';
import { Button, Card, Icon, IntervalBar, Screen, Section, Sheet, T, s } from '../ui/components';
import { sessSummary } from '../ui/helpers';
import { C, F } from '../ui/theme';

/** Session preview: intervals, planned duration, treadmill/outdoor choice and sound test. */
export default function SessionPreview() {
  const params = useLocalSearchParams<{ pid: ProgramId; w: string; s: string }>();
  const pid = params.pid, w = Number(params.w), si = Number(params.s);
  const d = useData();
  const { t, lang } = useT();
  const [env, setEnv] = useState<Env | null>(null); // chosen every time – no default
  const [denied, setDenied] = useState(false);
  const [starting, setStarting] = useState(false);
  const segs = sessionSegments(pid, w, si);
  const total = segmentsTotal(segs), run = segmentsRun(segs);

  const soundTest = () => {
    audio.tone('run', d.settings.volume);
    audio.vibrate(d.settings.vibration, [0, 200, 100, 200]);
    setTimeout(() => audio.speak(translate(d.settings.voiceLang, 'sound_test_say'), d.settings.voiceLang, d.settings.volume), 500);
  };

  const go = async (gps: boolean) => {
    setStarting(true);
    await startWorkout(pid, w, si, env!, gps);
    router.replace('/workout');
  };

  const start = async () => {
    if (!env || starting) return;
    if (env === 'outdoor' && Platform.OS === 'web') return go(true); // browser demo simulates GPS
    if (env === 'outdoor') {
      const r = await ensureLocationPermission();
      if (r !== 'granted') { setDenied(true); return; }
      return go(true);
    }
    return go(false);
  };

  const starts = segs.map((_, i) => segmentsTotal(segs.slice(0, i)));
  return (
    <Screen back title={`${t('week')} ${w + 1} · ${t('session')} ${si + 1}`}
      footer={<View style={{ gap: 10 }}>
        <Button kind="ghost" title={t('sound_test')} icon={<Icon name="speaker" size={18} />} onPress={soundTest} />
        <Button title={env ? t('start_session') : t('env_need')} disabled={!env || starting} onPress={start} />
      </View>}>
      <T style={[s.small, s.muted, { marginBottom: 14, marginTop: -4 }]}>{t(pid)} · {sessSummary(sessionSpec(pid, w, si), t, lang)}</T>
      <Card>
        <View style={[s.row, { marginBottom: 14 }]}>
          <View style={{ flex: 1 }}><T style={s.xs}>{t('planned')}</T><T style={s.h2}>{clock(total)}</T></View>
          <View style={{ flex: 1 }}><T style={s.xs}>{t('run_time')}</T><T style={[s.h2, { color: C.lime }]}>{clock(run)}</T></View>
          <View style={{ flex: 1 }}><T style={s.xs}>{t('walk_time')}</T><T style={s.h2}>{clock(total - run)}</T></View>
        </View>
        <IntervalBar segs={segs} />
      </Card>

      <Section title={t('env_q')} />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {(['treadmill', 'outdoor'] as Env[]).map((e) => (
          <Pressable key={e} accessibilityRole="radio" accessibilityState={{ selected: env === e }} onPress={() => setEnv(e)}
            style={{ flex: 1, backgroundColor: env === e ? C.navy3 : C.deep, borderRadius: 16, padding: 14, borderWidth: 2, borderColor: env === e ? C.lime : 'transparent' }}>
            <Icon name={e} color={C.lime} size={30} />
            <T style={{ fontFamily: F.bold, fontSize: 16, marginTop: 8, marginBottom: 4 }}>{t(e)}</T>
            <T style={s.xs}>{t(e === 'treadmill' ? 'treadmill_note' : 'outdoor_note')}</T>
          </Pressable>
        ))}
      </View>

      <Section title={t('intervals')} />
      <Card style={{ paddingVertical: 4 }}>
        {segs.map((x, i) => {
          const at = starts[i];
          const color = x.role ? C.warmBar : x.type === 'run' ? C.lime : C.walkBar;
          return (
            <View key={i} style={[s.row, { paddingVertical: 10 }, i > 0 && { borderTopWidth: 1, borderTopColor: C.line }]}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
              <T style={{ flex: 1 }}><T style={{ fontFamily: F.bold }}>{x.role === 'warm' ? t('warmup') : x.role === 'cool' ? t('cooldown') : t(x.type)}</T><T style={[s.small, s.muted]}>  {shortDur(x.dur, lang)}</T></T>
              <T style={s.xs}>{clock(at)}</T>
            </View>
          );
        })}
      </Card>

      <Sheet visible={denied} onClose={() => setDenied(false)} title={t('location_title')} text={t('location_denied')}>
        <Button title={t('continue_without')} onPress={() => { setDenied(false); void go(false); }} />
        <Button kind="ghost" title={t('open_settings')} onPress={() => { setDenied(false); openAppSettings(); }} />
      </Sheet>
    </Screen>
  );
}
