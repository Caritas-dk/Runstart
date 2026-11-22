import React, { useEffect, useState } from 'react';
import { BackHandler, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { canExtraWalk, runIntervalInfo } from '../core/engine';
import { avgPace, paceFromSpeed } from '../core/gps';
import { clock, countdownClock, km, kmh, pace, shortDur } from '../core/format';
import type { Segment } from '../core/types';
import { useT } from '../store/store';
import { demoSetSpeed, demoSkipInterval, extraWalk, getLastResult, stopWorkout, togglePause, useLiveWorkout } from '../services/workout';
import * as demoClock from '../services/clock';
import { Button, Icon, Sheet, T } from '../ui/components';
import { C, F } from '../ui/theme';

export default function Workout() {
  const live = useLiveWorkout();
  const { t, lang } = useT();
  const ins = useSafeAreaInsets();
  const [askStop, setAskStop] = useState(false);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => { setAskStop(true); return true; });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!live) router.replace(getLastResult() ? '/summary' : '/');
  }, [live]);

  if (!live) return <View style={{ flex: 1, backgroundColor: C.navy }} />;

  const { snap, engine } = live;
  const seg = snap.seg;
  const paused = snap.paused;
  const isRun = !paused && seg.type === 'run';
  const fg = isRun ? C.black : C.white;
  const bg = paused ? C.black : isRun ? C.lime : C.navy;
  const label = (x: Segment) => x.role === 'warm' ? t('warmup') : x.role === 'cool' ? t('cooldown') : t(x.type);
  const nx = engine.segments[snap.idx + 1];
  const info = runIntervalInfo(engine, snap.idx);
  const sub = paused ? `${label(seg)} · ${countdownClock(snap.segRemaining)}` : seg.extra ? t('extra_lbl') : seg.type === 'run' && info.of > 1 ? t('interval_of', { a: info.n, b: info.of }) : '';
  const big = paused ? t('paused') : label(seg);
  const tile = isRun ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.07)';

  const stat = (v: string, k: string) => (
    <View style={[st.tile, { backgroundColor: tile }]}>
      <T style={[st.tileV, { color: fg }]} numberOfLines={1}>{v}</T>
      <T style={[st.tileK, { color: fg }]} numberOfLines={1}>{k}</T>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: bg, paddingTop: ins.top + 8 }}>
      <View style={{ paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <T style={{ color: fg, opacity: 0.7, fontFamily: F.bold, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, flexShrink: 1 }} numberOfLines={1}>
          {t(live.pid)} · {t('week')} {live.w + 1} · {t('session')} {live.s + 1}
        </T>
        <View style={{ backgroundColor: 'rgba(127,127,127,0.25)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
          <T style={{ color: fg, fontFamily: F.bold, fontSize: 11, textTransform: 'uppercase' }}>{live.env === 'outdoor' ? t('out_badge') : t('tm_badge')}</T>
        </View>
      </View>

      {demoClock.DEMO ? (
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 6, paddingHorizontal: 20, marginTop: 8 }}>
          <T style={{ color: fg, opacity: 0.6, fontFamily: F.bold, fontSize: 11 }}>DEMO</T>
          {[1, 10, 60].map((x) => {
            const on = demoClock.getSpeed() === x;
            return (
              <Pressable key={x} accessibilityRole="button" onPress={() => demoSetSpeed(x)}
                style={{ paddingHorizontal: 9, paddingVertical: 5, borderRadius: 8, backgroundColor: on ? (isRun ? C.black : C.lime) : 'rgba(127,127,127,0.25)' }}>
                <T style={{ fontFamily: F.bold, fontSize: 12, color: on ? (isRun ? C.lime : C.black) : fg }}>{x}×</T>
              </Pressable>
            );
          })}
          <Pressable accessibilityRole="button" onPress={demoSkipInterval} style={{ paddingHorizontal: 9, paddingVertical: 5, borderRadius: 8, backgroundColor: 'rgba(127,127,127,0.25)' }}>
            <T style={{ fontFamily: F.bold, fontSize: 12, color: fg }}>»</T>
          </Pressable>
        </View>
      ) : null}

      <View style={{ alignItems: 'center', marginTop: demoClock.DEMO ? 4 : 14, paddingHorizontal: 16 }}>
        <T style={{ color: fg, fontFamily: F.display, fontSize: big.length > 9 ? 48 : 64, lineHeight: big.length > 9 ? 52 : 68, textTransform: 'uppercase', letterSpacing: 1 }} numberOfLines={1} adjustsFontSizeToFit>{big}</T>
        <T style={{ color: fg, opacity: 0.7, fontFamily: F.semibold, minHeight: 20 }}>{sub}</T>
        <T style={{ color: fg, fontFamily: F.displayBold, fontSize: 108, lineHeight: 116, fontVariant: ['tabular-nums'] }} accessibilityLiveRegion="polite">{countdownClock(snap.segRemaining)}</T>
      </View>

      <View style={{ flexDirection: 'row', height: 8, gap: 2, marginHorizontal: 16, marginBottom: 10, borderRadius: 4, overflow: 'hidden' }}>
        {engine.segments.map((x, i) => (
          <View key={i} style={{ flex: Math.max(1, x.dur), backgroundColor: 'rgba(127,127,127,0.35)' }}>
            <View style={{ height: '100%', width: `${i < snap.idx ? 100 : i === snap.idx ? (snap.segEl / Math.max(1, x.dur)) * 100 : 0}%`, backgroundColor: fg }} />
          </View>
        ))}
      </View>

      <T style={{ color: fg, textAlign: 'center', fontFamily: F.semibold, fontSize: 16, marginBottom: 12 }}>
        {nx ? <>{t('next')}: <T style={{ color: fg, fontFamily: F.bold, fontSize: 16 }}>{label(nx)}</T> · {shortDur(nx.dur, lang)}</> : <T style={{ color: fg, fontFamily: F.bold, fontSize: 16 }}>{t('last')}</T>}
      </T>

      <View style={st.row}>{stat(clock(snap.active), t('active'))}{stat(clock(snap.remaining), t('remaining'))}{stat(clock(snap.total), t('total'))}</View>

      {live.env === 'outdoor' ? (
        live.gps === 'unavailable' ? (
          <T style={{ color: fg, opacity: 0.7, textAlign: 'center', marginTop: 10, paddingHorizontal: 20 }}>{t('gps_off')}</T>
        ) : (
          <>
            <View style={[st.row, { marginTop: 8 }]}>{stat(km(live.track.dist, lang), `${t('distance')} (km)`)}{stat(paused ? kmh(0, lang) : kmh(live.track.speed, lang), `${t('speed')} (${t('kmh')})`)}</View>
            <View style={[st.row, { marginTop: 8 }]}>{stat(paused ? '–:––' : pace(paceFromSpeed(live.track.speed)), `${t('pace_now')} (${t('perkm')})`)}{stat(pace(avgPace(snap.active, live.track.dist)), `${t('pace_avg')} (${t('perkm')})`)}</View>
            {live.gps === 'waiting' ? <T style={{ color: fg, opacity: 0.7, textAlign: 'center', marginTop: 6, fontSize: 13 }}>{t('gps_wait')}</T> : null}
          </>
        )
      ) : null}

      <View style={{ marginTop: 'auto', paddingHorizontal: 16, paddingBottom: Math.max(ins.bottom, 16) + 4, gap: 10 }}>
        {canExtraWalk(snap) ? (
          <Pressable accessibilityRole="button" onPress={extraWalk} style={{ height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: tile }}>
            <T style={{ color: fg, fontFamily: F.bold }}>{t('extra_walk')}</T>
          </Pressable>
        ) : null}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Pressable accessibilityRole="button" accessibilityLabel={paused ? t('resume') : t('pause')} onPress={togglePause}
            style={[st.big, { flex: 2, backgroundColor: isRun ? C.black : C.lime }]}>
            <Icon name={paused ? 'play' : 'pause'} color={isRun ? C.lime : C.black} size={26} />
            <T style={[st.bigT, { color: isRun ? C.lime : C.black }]}>{paused ? t('resume') : t('pause')}</T>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={t('stop')} onPress={() => setAskStop(true)}
            style={[st.big, { flex: 1, borderWidth: 2, borderColor: fg }]}>
            <Icon name="stop" color={fg} size={22} />
            <T style={[st.bigT, { color: fg }]}>{t('stop')}</T>
          </Pressable>
        </View>
      </View>

      <Sheet visible={askStop} onClose={() => setAskStop(false)} title={t('stop_q')} text={t('stop_text')}>
        <Button kind="white" title={t('stop_no')} onPress={() => setAskStop(false)} />
        <Button kind="danger" title={t('stop_yes')} onPress={async () => { setAskStop(false); await stopWorkout(); }} />
      </Sheet>
    </View>
  );
}

const st = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, paddingHorizontal: 16 },
  tile: { flex: 1, borderRadius: 12, paddingVertical: 9, paddingHorizontal: 6, alignItems: 'center' },
  tileV: { fontFamily: F.displayBold, fontSize: 25, fontVariant: ['tabular-nums'] },
  tileK: { fontSize: 10.5, fontFamily: F.bold, textTransform: 'uppercase', letterSpacing: 0.4, opacity: 0.65 },
  big: { height: 78, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  bigT: { fontFamily: F.bold, fontSize: 20 },
});
