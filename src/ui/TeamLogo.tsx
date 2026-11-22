import React, { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { C, F } from './theme';

/** Spark with speed lines – the Team Ingberg mark. */
export function TeamSpark({ size = 46 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <G stroke={C.lime} strokeWidth={3.2} strokeLinecap="round">
        <Path d="M3 20 H11" />
        <Path d="M1 27 H9" />
        <Path d="M5 34 H12" />
      </G>
      <Path d="M30 4 L33.5 17 L46 13 L37 23 L47 31 L34 30 L31 44 L26 32 L14 37 L21 26 L12 18 L25 19 Z" fill={C.lime} />
      <Circle cx={30} cy={24} r={4} fill={C.navy} />
    </Svg>
  );
}

/**
 * "TEAM INGBERG" logo for the bottom of the start-up screen. It pops in with
 * a little bounce and the spark spins into place – energy and spontaneity.
 */
export function TeamLogo({ delay = 250 }: { delay?: number }) {
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 650, delay, easing: Easing.out(Easing.back(2.2)), useNativeDriver: true }).start();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const translateY = v.interpolate({ inputRange: [0, 1], outputRange: [24, 0] });
  const rotate = v.interpolate({ inputRange: [0, 1], outputRange: ['-90deg', '0deg'] });
  const scale = v.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });
  return (
    <Animated.View style={[s.row, { opacity: v.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 1, 1] }), transform: [{ translateY }] }]}
      accessible accessibilityLabel="Team Ingberg">
      <Animated.View style={{ transform: [{ rotate }, { scale }] }}><TeamSpark /></Animated.View>
      <View style={s.words}>
        <Text style={s.team}>TEAM</Text>
        <Text style={s.name}>INGBERG</Text>
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  words: { transform: [{ skewX: '-12deg' }] },
  team: { fontFamily: F.display, color: C.white, opacity: 0.85, fontSize: 13, lineHeight: 14, letterSpacing: 5 },
  name: { fontFamily: F.display, color: C.lime, fontSize: 30, lineHeight: 31, letterSpacing: 1 },
});
