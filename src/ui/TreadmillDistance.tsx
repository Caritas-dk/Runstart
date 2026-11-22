import React, { useState } from 'react';
import { TextInput, View } from 'react-native';
import { isPlausibleKm, parseKm, setManualDistance } from '../core/manualDistance';
import { newMilestones, type Milestone } from '../core/milestones';
import { km as fmtKm } from '../core/format';
import type { WorkoutRecord } from '../core/types';
import { getData, update, useT } from '../store/store';
import { Button, T, s } from './components';
import { C, F } from './theme';

/**
 * Lets the runner type in the distance shown on the treadmill after a
 * treadmill session. Nothing GPS-based is involved. Returns newly reached
 * milestones so the caller can celebrate them.
 */
export function TreadmillDistance({ rec, onMilestones, compact }: { rec: WorkoutRecord; onMilestones?: (m: Milestone[]) => void; compact?: boolean }) {
  const { t, lang } = useT();
  const [editing, setEditing] = useState(rec.dist == null);
  const [text, setText] = useState(rec.dist != null ? fmtKm(rec.dist, lang).replace(/0+$/, '').replace(/[.,]$/, '') : '');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const save = (value: number | null) => {
    if (value !== null && !isPlausibleKm(value, rec.run, rec.walk)) { setError(t('tm_dist_invalid')); return; }
    const before = getData().history.map((h) => ({ ...h }));
    update((d) => { setManualDistance(d.history, rec.id, value); });
    const reached = newMilestones(before, getData().history);
    if (reached.length) onMilestones?.(reached);
    setError('');
    setEditing(value === null);
    if (value === null) setText('');
    setSaved(value !== null);
  };

  if (!editing && rec.dist != null) {
    return (
      <View style={[s.row, s.between]}>
        <View style={{ flex: 1 }}>
          {!compact ? <T style={[s.xs, { fontFamily: F.bold, textTransform: 'uppercase', letterSpacing: 0.5 }]}>{t('tm_dist_title')}</T> : null}
          <T style={{ fontFamily: F.displayBold, fontSize: 28 }}>{fmtKm(rec.dist, lang)} km <T style={s.xs}>· {t('manual_tag')}</T></T>
          {saved ? <T style={[s.xs, { color: C.lime }]}>{t('tm_dist_saved')}</T> : null}
        </View>
        <Button small kind="dark" title={t('tm_dist_edit')} onPress={() => { setEditing(true); setSaved(false); }} />
      </View>
    );
  }

  return (
    <View>
      {!compact ? <T style={[s.xs, { fontFamily: F.bold, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }]}>{t('tm_dist_title')}</T> : null}
      <T style={[s.xs, { marginBottom: 10, lineHeight: 17 }]}>{t('tm_dist_note')}</T>
      <View style={[s.row]}>
        <View style={{ flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.deep, borderRadius: 12, borderWidth: 1.5, borderColor: error ? C.danger : C.line, paddingHorizontal: 12 }}>
          <TextInput
            value={text}
            onChangeText={(v) => { setText(v); setError(''); }}
            placeholder={t('tm_dist_placeholder')}
            placeholderTextColor="rgba(255,255,255,0.35)"
            keyboardType="decimal-pad"
            returnKeyType="done"
            maxLength={6}
            accessibilityLabel={t('tm_dist_title')}
            onSubmitEditing={() => { const v = parseKm(text); if (v === null) setError(t('tm_dist_invalid')); else save(v); }}
            style={{ flex: 1, flexBasis: 0, minWidth: 0, color: C.white, fontFamily: F.displayBold, fontSize: 24, paddingVertical: 10 }}
          />
          <T style={[s.muted, { fontFamily: F.semibold }]}>km</T>
        </View>
        <Button small title={t('save')} onPress={() => { const v = parseKm(text); if (v === null) setError(t('tm_dist_invalid')); else save(v); }} />
      </View>
      {error ? <T style={{ color: C.danger, fontSize: 13, marginTop: 8 }}>{error}</T> : null}
      {rec.dist != null ? (
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
          <Button small kind="ghost" title={t('cancel')} onPress={() => { setEditing(false); setError(''); }} />
          <Button small kind="danger" title={t('tm_dist_remove')} onPress={() => save(null)} />
        </View>
      ) : null}
    </View>
  );
}
