import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { RunnerMark } from './RunnerMark';
import { C, F } from './theme';

/**
 * Start-up splash "RUNSTART 0-GOAL". It looks exactly like the native
 * splash image, so the hand-over is invisible; it stays briefly so the
 * name can be read, then fades into the app.
 */
export function SplashOverlay({ onShown, holdMs = 1300 }: { onShown?: () => void; holdMs?: number }) {
  const [opacity] = useState(() => new Animated.Value(1));
  const [gone, setGone] = useState(false);
  useEffect(() => {
    onShown?.();
    const t = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 450, useNativeDriver: true }).start(() => setGone(true));
    }, holdMs);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  if (gone) return null;
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, s.wrap, { opacity }]} accessibilityLabel="Runstart 0-GOAL">
      <RunnerMark size={176} />
      <Text style={s.title}>RUNSTART</Text>
      <Text style={s.sub}>0-GOAL</Text>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  wrap: { backgroundColor: C.navy, alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  title: { fontFamily: F.display, color: C.white, fontSize: 60, lineHeight: 62, letterSpacing: 1.5, marginTop: -4 },
  sub: { fontFamily: F.display, color: C.lime, fontSize: 38, lineHeight: 40, letterSpacing: 3 },
});
