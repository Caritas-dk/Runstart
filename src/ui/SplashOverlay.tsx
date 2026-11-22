import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { C, F } from './theme';

/** Original quote in the spirit of Forrest Gump (not a line from the film). */
export const SPLASH_QUOTE = 'Da Mette nåede enden af vejen, tænkte hun: »Nu er jeg her jo alligevel.« Så vendte hun om og løb videre.';

/**
 * Start-up splash "METTE EDITION". The title matches the native splash
 * image, so the hand-over is invisible; the quote fades in underneath,
 * stays long enough to be read, then everything fades into the app.
 */
export function SplashOverlay({ onShown, holdMs = 3600 }: { onShown?: () => void; holdMs?: number }) {
  const [opacity] = useState(() => new Animated.Value(1));
  const [quote] = useState(() => new Animated.Value(0));
  const [gone, setGone] = useState(false);
  useEffect(() => {
    onShown?.();
    Animated.timing(quote, { toValue: 1, duration: 600, delay: 250, useNativeDriver: true }).start();
    const t = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 450, useNativeDriver: true }).start(() => setGone(true));
    }, holdMs);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  if (gone) return null;
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, s.wrap, { opacity }]} accessibilityLabel={`Mette Edition. ${SPLASH_QUOTE}`}>
      <View style={s.titleBox}>
        <Text style={s.title}>METTE</Text>
        <Text style={s.sub}>EDITION</Text>
      </View>
      <Animated.View style={[s.quoteBox, { opacity: quote }]}>
        <Text style={s.quote}>{SPLASH_QUOTE}</Text>
        <Text style={s.credit}>— frit efter Forrest Gump</Text>
      </Animated.View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  wrap: { backgroundColor: C.navy, alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  titleBox: { alignItems: 'center' },
  title: { fontFamily: F.display, color: C.white, fontSize: 72, lineHeight: 74, letterSpacing: 2 },
  sub: { fontFamily: F.display, color: C.lime, fontSize: 40, lineHeight: 44, letterSpacing: 8 },
  quoteBox: { position: 'absolute', left: 36, right: 36, bottom: '14%', alignItems: 'center' },
  quote: { fontFamily: F.body, color: C.white, fontSize: 17, lineHeight: 25, textAlign: 'center', fontStyle: 'italic', opacity: 0.92 },
  credit: { fontFamily: F.body, color: C.lime, fontSize: 13, marginTop: 10, letterSpacing: 0.5 },
});
