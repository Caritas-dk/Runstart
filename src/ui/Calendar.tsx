import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { isoDate, parseIsoDate, weekday } from '../core/dates';
import { useT } from '../store/store';
import { Icon, T, s } from './components';
import { C, F } from './theme';

/** Simple month calendar – no native date picker needed, works the same on iOS and Android. */
export function Calendar({ value, min, onChange, highlightDays }: { value: string; min?: string; onChange: (iso: string) => void; highlightDays?: number[] }) {
  const { L } = useT();
  const start = parseIsoDate(value || min || isoDate(new Date()));
  const [ym, setYm] = useState({ y: start.getFullYear(), m: start.getMonth() });
  const first = new Date(ym.y, ym.m, 1);
  const lead = weekday(first);
  const daysIn = new Date(ym.y, ym.m + 1, 0).getDate();
  const cells: (string | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= daysIn; d++) cells.push(isoDate(new Date(ym.y, ym.m, d)));
  while (cells.length % 7) cells.push(null);
  const move = (n: number) => setYm(({ y, m }) => { const d = new Date(y, m + n, 1); return { y: d.getFullYear(), m: d.getMonth() }; });
  return (
    <View>
      <View style={[s.row, s.between, { marginBottom: 8 }]}>
        <Pressable accessibilityRole="button" onPress={() => move(-1)} hitSlop={10} style={{ padding: 6, transform: [{ rotate: '180deg' }] }}><Icon name="chev" size={20} /></Pressable>
        <T style={{ fontFamily: F.bold }}>{L.monthsLong[ym.m]} {ym.y}</T>
        <Pressable accessibilityRole="button" onPress={() => move(1)} hitSlop={10} style={{ padding: 6 }}><Icon name="chev" size={20} /></Pressable>
      </View>
      <View style={{ flexDirection: 'row' }}>
        {L.days.map((d) => <T key={d} style={[s.xs, { flex: 1, textAlign: 'center', marginBottom: 4 }]}>{d}</T>)}
      </View>
      {Array.from({ length: cells.length / 7 }, (_, r) => (
        <View key={r} style={{ flexDirection: 'row' }}>
          {cells.slice(r * 7, r * 7 + 7).map((iso, i) => {
            if (!iso) return <View key={i} style={{ flex: 1, height: 40 }} />;
            const disabled = !!min && iso < min;
            const sel = iso === value;
            const hl = highlightDays?.includes(weekday(parseIsoDate(iso)));
            return (
              <Pressable key={i} accessibilityRole="button" accessibilityState={{ selected: sel, disabled }} disabled={disabled} onPress={() => onChange(iso)}
                style={{ flex: 1, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: sel ? C.lime : hl ? C.navy3 : 'transparent' }}>
                  <T style={{ color: sel ? C.black : disabled ? 'rgba(255,255,255,0.25)' : C.white, fontFamily: sel ? F.bold : F.medium }}>{parseIsoDate(iso).getDate()}</T>
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}
