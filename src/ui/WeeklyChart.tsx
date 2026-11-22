import React, { useState } from 'react';
import { View } from 'react-native';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';
import type { WeekBucket } from '../core/stats';
import { C } from './theme';

export function WeeklyChart({ weeks }: { weeks: WeekBucket[] }) {
  const [w, setW] = useState(320);
  const H = 130, pad = 24;
  const max = Math.max(30, ...weeks.map((x) => x.run + x.walk));
  if (w < 80) return <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ height: H + 18 }} />;
  const bw = (w - pad) / weeks.length;
  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      <Svg width={w} height={H + 18}>
        {[0, 0.5, 1].map((f) => {
          const y = H - f * (H - 10);
          return [
            <Line key={'l' + f} x1={pad} x2={w} y1={y} y2={y} stroke="rgba(255,255,255,0.08)" />,
            <SvgText key={'t' + f} x={0} y={y + 3} fill="rgba(255,255,255,0.6)" fontSize={10}>{String(Math.round(max * f))}</SvgText>,
          ];
        })}
        {weeks.map((wk, i) => {
          const x = pad + i * bw + bw * 0.18, bwid = bw * 0.64;
          const hr = (wk.run / max) * (H - 10), hw = (wk.walk / max) * (H - 10);
          return [
            hw > 0 ? <Rect key={'w' + i} x={x} y={H - hw} width={bwid} height={hw} rx={3} fill={C.walkBar} /> : null,
            hr > 0 ? <Rect key={'r' + i} x={x} y={H - hw - hr - (hw ? 2 : 0)} width={bwid} height={hr} rx={3} fill={C.lime} /> : null,
            <SvgText key={'d' + i} x={x + bwid / 2} y={H + 14} fill="rgba(255,255,255,0.6)" fontSize={10} textAnchor="middle">{`${wk.start.getDate()}/${wk.start.getMonth() + 1}`}</SvgText>,
          ];
        })}
      </Svg>
    </View>
  );
}
