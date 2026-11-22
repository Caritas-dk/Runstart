import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import type { Milestone } from '../core/milestones';
import { T } from './components';
import { C, F } from './theme';

/** Round medal with a short label. Locked medals are dimmed outlines. */
export function MilestoneBadge({ m, size = 56, locked }: { m: Milestone; size?: number; locked?: boolean }) {
  const fg = locked ? 'rgba(255,255,255,0.35)' : C.black;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 56 56" style={{ position: 'absolute' }}>
        {/* little laurel ticks around the medal */}
        {!locked ? Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          const x1 = 28 + Math.cos(a) * 25, y1 = 28 + Math.sin(a) * 25, x2 = 28 + Math.cos(a) * 27.5, y2 = 28 + Math.sin(a) * 27.5;
          return <Path key={i} d={`M${x1} ${y1}L${x2} ${y2}`} stroke={C.lime} strokeWidth={2} strokeLinecap="round" />;
        }) : null}
        <Circle cx={28} cy={28} r={22} fill={locked ? 'transparent' : C.lime} stroke={locked ? 'rgba(255,255,255,0.25)' : C.lime} strokeWidth={2} strokeDasharray={locked ? '4 4' : undefined} />
      </Svg>
      <T style={{ fontFamily: F.display, fontSize: m.badge.length > 4 ? size * 0.22 : size * 0.3, color: fg }} numberOfLines={1}>{m.badge}</T>
    </View>
  );
}
