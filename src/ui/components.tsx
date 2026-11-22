import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type TextProps, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { router } from 'expo-router';
import { C, F } from './theme';
import type { Segment } from '../core/types';
import { segmentsTotal } from '../core/programs';
import { useT } from '../store/store';
import { Flag } from './Flag';

export function T({ style, children, ...p }: TextProps) {
  return <Text {...p} style={[s.text, style]}>{children}</Text>;
}

export function Screen({ title, back, right, children, scroll = true, footer }: {
  title?: string; back?: boolean; right?: React.ReactNode; children: React.ReactNode; scroll?: boolean; footer?: React.ReactNode;
}) {
  const ins = useSafeAreaInsets();
  const { t } = useT();
  const Body = scroll ? ScrollView : View;
  return (
    <View style={[s.screen, { paddingTop: ins.top }]}>
      <View style={s.top}>
        {back ? (
          <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={12} style={s.back}>
            <Icon name="back" color={C.lime} size={20} /><T style={s.backText}>{t('back')}</T>
          </Pressable>
        ) : <View />}
        <View style={s.topRight}>{right}<GearButton /></View>
      </View>
      {title ? <T style={s.h1}>{title}</T> : null}
      <Body style={{ flex: 1 }} contentContainerStyle={scroll ? { paddingHorizontal: 20, paddingBottom: 40 } : undefined}>
        {scroll ? children : <View style={{ flex: 1, paddingHorizontal: 20 }}>{children}</View>}
      </Body>
      {footer ? <View style={{ paddingHorizontal: 20, paddingBottom: Math.max(ins.bottom, 12), paddingTop: 8 }}>{footer}</View> : null}
    </View>
  );
}

/** Small flag of the current text language in the top-right corner; tap to change language. */
export function GearButton() {
  const { t, lang } = useT();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={t('lang_title')} onPress={() => router.push('/language')} hitSlop={10}
      style={({ pressed }) => [s.flagBtn, pressed && { opacity: 0.7 }]}>
      <Flag lang={lang} width={28} />
    </Pressable>
  );
}

export function Card({ children, style, lime }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; lime?: boolean }) {
  return <View style={[s.card, lime && { backgroundColor: C.lime }, style]}>{children}</View>;
}

type BtnKind = 'lime' | 'dark' | 'ghost' | 'white' | 'navy' | 'danger';
export function Button({ title, onPress, kind = 'lime', disabled, small, icon, style }: {
  title: string; onPress: () => void; kind?: BtnKind; disabled?: boolean; small?: boolean; icon?: React.ReactNode; style?: StyleProp<ViewStyle>;
}) {
  const bg: Record<BtnKind, string> = { lime: C.lime, dark: C.navy3, ghost: 'transparent', white: C.white, navy: C.navy, danger: 'transparent' };
  const fg: Record<BtnKind, string> = { lime: C.black, dark: C.white, ghost: C.white, white: C.black, navy: C.white, danger: C.danger };
  return (
    <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress}
      style={({ pressed }) => [s.btn, small && s.btnSm, { backgroundColor: bg[kind], opacity: disabled ? 0.35 : pressed ? 0.8 : 1 },
        kind === 'ghost' && { borderWidth: 1.5, borderColor: C.line }, kind === 'danger' && { borderWidth: 1.5, borderColor: C.danger }, style]}>
      {icon}
      <T style={[s.btnText, small && { fontSize: 14 }, { color: fg[kind] }]}>{title}</T>
    </Pressable>
  );
}

export function Chip({ title, on, onPress }: { title: string; on?: boolean; onPress?: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: !!on }} onPress={onPress} style={[s.chip, on && { backgroundColor: C.lime }]}>
      <T style={[s.chipText, on && { color: C.black }]}>{title}</T>
    </Pressable>
  );
}

export function Segmented<V extends string | number>({ value, options, onChange }: { value: V; options: [V, string][]; onChange: (v: V) => void }) {
  return (
    <View style={s.seg}>
      {options.map(([v, l]) => (
        <Pressable key={String(v)} accessibilityRole="button" accessibilityState={{ selected: v === value }} onPress={() => onChange(v)}
          style={[s.segBtn, v === value && { backgroundColor: C.lime }]}>
          <T style={[s.segText, v === value && { color: C.black }]} numberOfLines={1}>{l}</T>
        </Pressable>
      ))}
    </View>
  );
}

export function Toggle({ label, sub, value, onChange }: { label: string; sub?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <Pressable accessibilityRole="switch" accessibilityState={{ checked: value }} onPress={() => onChange(!value)} style={s.toggleRow}>
      <View style={{ flex: 1, paddingRight: 12 }}>
        <T style={{ fontFamily: F.semibold, fontSize: 14.5 }}>{label}</T>
        {sub ? <T style={[s.xs, { marginTop: 2 }]}>{sub}</T> : null}
      </View>
      <View style={[s.toggle, value && { backgroundColor: C.lime }]}>
        <View style={[s.knob, value && { left: 23, backgroundColor: C.black }]} />
      </View>
    </Pressable>
  );
}

export function Section({ title }: { title: string }) {
  return <T style={s.sec}>{title}</T>;
}

export function Badge({ title, kind = 'default' }: { title: string; kind?: 'default' | 'lime' | 'white' }) {
  const bg = kind === 'lime' ? C.lime : kind === 'white' ? C.white : C.navy3;
  return <View style={[s.badge, { backgroundColor: bg }]}><T style={[s.badgeText, kind !== 'default' && { color: C.black }]}>{title}</T></View>;
}

export function Stat({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <View style={s.stat}>
      <T style={[s.statV, accent && { color: C.lime }]} numberOfLines={1}>{value}</T>
      <T style={s.statK}>{label}</T>
    </View>
  );
}

export function Progress({ value, onLime }: { value: number; onLime?: boolean }) {
  return (
    <View style={[s.prog, onLime && { backgroundColor: 'rgba(0,0,0,0.15)' }]}>
      <View style={[s.progFill, { width: `${Math.max(0, Math.min(1, value)) * 100}%` }, onLime && { backgroundColor: C.navy }]} />
    </View>
  );
}

export function IntervalBar({ segs, onLime, height = 12 }: { segs: Segment[]; onLime?: boolean; height?: number }) {
  const total = segmentsTotal(segs);
  return (
    <View style={[s.bar, { height }]}>
      {segs.map((x, i) => {
        const color = x.role ? (onLime ? 'rgba(11,31,58,0.45)' : C.warmBar) : x.type === 'run' ? (onLime ? C.white : C.lime) : onLime ? C.navy : C.walkBar;
        return <View key={i} style={{ flex: x.dur / total, backgroundColor: color, borderRadius: 2 }} />;
      })}
    </View>
  );
}

export function Legend() {
  const { t } = useT();
  const item = (c: string, l: string) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: c }} /><T style={s.xs}>{l}</T>
    </View>
  );
  return <View style={{ flexDirection: 'row', gap: 14, flexWrap: 'wrap' }}>{item(C.warmBar, t('warmup') + '/' + t('cooldown'))}{item(C.lime, t('run'))}{item(C.walkBar, t('walk'))}</View>;
}

export function Sheet({ visible, onClose, title, text, children }: { visible: boolean; onClose: () => void; title: string; text?: string; children: React.ReactNode }) {
  const ins = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={s.modalBg} onPress={onClose}>
        <Pressable style={[s.sheet, { paddingBottom: Math.max(ins.bottom, 16) + 8 }]} onPress={() => {}}>
          <T style={s.sheetTitle}>{title}</T>
          {text ? <T style={s.sheetText}>{text}</T> : null}
          <View style={{ gap: 10 }}>{children}</View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

type IconName = 'home' | 'programs' | 'history' | 'settings' | 'gear' | 'back' | 'chev' | 'down' | 'treadmill' | 'outdoor' | 'speaker' | 'pause' | 'play' | 'stop';
export function Icon({ name, color = C.white, size = 24 }: { name: IconName; color?: string; size?: number }) {
  const p = { stroke: color, strokeWidth: 2, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'home' && <Path {...p} d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />}
      {name === 'programs' && <><Rect {...p} x={3} y={4} width={18} height={17} rx={2} /><Path {...p} d="M3 9h18M8 2v4M16 2v4M7 13h3M7 17h6" /></>}
      {name === 'history' && <Path {...p} d="M4 20V10M10 20V4M16 20v-7M22 20H2" />}
      {name === 'settings' && <><Path {...p} d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12" /><Circle {...p} cx={16} cy={6} r={2} /><Circle {...p} cx={10} cy={12} r={2} /><Circle {...p} cx={18} cy={18} r={2} /></>}
      {name === 'gear' && <><Circle {...p} cx={12} cy={12} r={3} /><Path {...p} d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68 1.65 1.65 0 0 0 10 3.17V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></>}
      {name === 'back' && <Path {...p} strokeWidth={2.4} d="M15 6l-6 6 6 6" />}
      {name === 'chev' && <Path {...p} strokeWidth={2.2} d="M9 6l6 6-6 6" />}
      {name === 'down' && <Path {...p} strokeWidth={2.2} d="M6 9l6 6 6-6" />}
      {name === 'treadmill' && <><Path {...p} d="M3 18h15l3-3M6 18l-1 3M17 18l1 3M15 4l2 8" /><Circle {...p} cx={12} cy={5} r={1.5} /><Path {...p} d="M10 9l-2 4 3 1 1 3" /></>}
      {name === 'outdoor' && <><Path {...p} d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" /><Circle {...p} cx={12} cy={9.5} r={2.5} /></>}
      {name === 'speaker' && <Path {...p} d="M4 9h4l5-4v14l-5-4H4zM17 9a4 4 0 0 1 0 6M19.5 6.5a8 8 0 0 1 0 11" />}
      {name === 'pause' && <><Rect x={6} y={4} width={4} height={16} rx={1} fill={color} /><Rect x={14} y={4} width={4} height={16} rx={1} fill={color} /></>}
      {name === 'play' && <Path d="M7 4l13 8-13 8z" fill={color} />}
      {name === 'stop' && <Rect x={5} y={5} width={14} height={14} rx={2} fill={color} />}
    </Svg>
  );
}

export const s = StyleSheet.create({
  text: { color: C.white, fontFamily: F.body, fontSize: 15 },
  screen: { flex: 1, backgroundColor: C.navy },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, minHeight: 44 },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6 },
  backText: { color: C.lime, fontFamily: F.semibold },
  gear: { width: 38, height: 38, borderRadius: 19, backgroundColor: C.navy2, alignItems: 'center', justifyContent: 'center' },
  flagBtn: { height: 38, paddingHorizontal: 6, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  h1: { fontFamily: F.display, fontSize: 32, textTransform: 'uppercase', letterSpacing: 0.3, paddingHorizontal: 20, marginBottom: 10, marginTop: 2 },
  h2: { fontFamily: F.displayBold, fontSize: 24, textTransform: 'uppercase', letterSpacing: 0.3 },
  h3: { fontFamily: F.bold, fontSize: 16 },
  muted: { color: C.muted },
  small: { fontSize: 13.5 },
  xs: { fontSize: 12, color: C.muted },
  card: { backgroundColor: C.navy2, borderRadius: 16, padding: 16, marginBottom: 12 },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 15, paddingHorizontal: 14, borderRadius: 14, minHeight: 52 },
  btnSm: { paddingVertical: 10, minHeight: 42, borderRadius: 12 },
  btnText: { fontFamily: F.bold, fontSize: 16 },
  chip: { paddingVertical: 8, paddingHorizontal: 13, borderRadius: 99, backgroundColor: C.navy3, alignItems: 'center' },
  chipText: { fontFamily: F.semibold, fontSize: 13 },
  seg: { flexDirection: 'row', backgroundColor: C.deep, borderRadius: 12, padding: 4, gap: 4 },
  segBtn: { flex: 1, paddingVertical: 10, paddingHorizontal: 4, borderRadius: 9, alignItems: 'center' },
  segText: { fontFamily: F.semibold, fontSize: 13.5, color: C.muted },
  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  toggle: { width: 50, height: 30, borderRadius: 15, backgroundColor: C.navy3 },
  knob: { position: 'absolute', top: 3, left: 3, width: 24, height: 24, borderRadius: 12, backgroundColor: C.white },
  sec: { fontSize: 12, fontFamily: F.bold, letterSpacing: 1, textTransform: 'uppercase', color: C.muted, marginTop: 18, marginBottom: 8 },
  badge: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 6, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, fontFamily: F.bold, letterSpacing: 0.3, textTransform: 'uppercase' },
  stat: { flex: 1, backgroundColor: C.deep, borderRadius: 14, padding: 12, minWidth: 0 },
  statV: { fontFamily: F.displayBold, fontSize: 26, lineHeight: 30 },
  statK: { fontSize: 11, color: C.muted, fontFamily: F.semibold, textTransform: 'uppercase', letterSpacing: 0.5 },
  prog: { height: 8, backgroundColor: C.navy3, borderRadius: 4, overflow: 'hidden' },
  progFill: { height: '100%', backgroundColor: C.lime, borderRadius: 4 },
  bar: { flexDirection: 'row', gap: 2, borderRadius: 6, overflow: 'hidden' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: C.navy2, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 22 },
  sheetTitle: { fontFamily: F.display, fontSize: 26, textTransform: 'uppercase', marginBottom: 8 },
  sheetText: { color: C.muted, marginBottom: 16, lineHeight: 21 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  between: { justifyContent: 'space-between' },
  grid2: { flexDirection: 'row', gap: 10, marginBottom: 10 },
});
