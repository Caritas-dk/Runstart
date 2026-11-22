import React from 'react';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';
import { C } from './theme';

/** Runstart mark: a pictogram runner crossing a checkered finish line. Same drawing as assets/splash-icon.png. */
export function RunnerMark({ size = 200 }: { size?: number }) {
  const squares = Array.from({ length: 19 }, (_, i) => (
    <Rect key={i} x={106 + (i % 2 ? 8 : 0)} y={40 + 8 * i} width={8} height={8} fill={C.navy} />
  ));
  const limb = { stroke: C.lime, strokeWidth: 17, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  const tape = { stroke: C.white, strokeWidth: 5, fill: 'none', strokeLinecap: 'round' as const };
  return (
    <Svg width={size} height={size} viewBox="0 0 240 240">
      <Rect x={106} y={40} width={16} height={152} rx={3} fill={C.white} />
      <G>{squares}</G>
      <Path d="M24 196 H216" stroke={C.white} strokeWidth={6} strokeLinecap="round" />
      <Path d="M106 102 C92 96 80 110 62 102" {...tape} />
      <Path d="M122 102 C134 108 142 120 156 116" {...tape} />
      <Path d="M136 74 L116 124" {...limb} />
      <Path d="M132 84 L156 100 L172 86" {...limb} />
      <Path d="M129 86 L106 100 L90 90" {...limb} />
      <Path d="M116 124 L148 142 L160 187" {...limb} />
      <Path d="M116 124 L92 150 L64 152" {...limb} />
      <Circle cx={144} cy={52} r={15} fill={C.lime} />
    </Svg>
  );
}
