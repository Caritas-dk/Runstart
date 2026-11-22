import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { update, useData, useT, replaceData, deleteAll, translate } from '../../store/store';
import { LANGUAGE_NAMES } from '../../i18n/strings';
import type { AppData } from '../../core/types';
import * as audio from '../../services/audio';
import { requestReminderPermission } from '../../services/reminders';
import { exportBackup, pickBackup } from '../../services/backupFiles';
import { Button, Card, Icon, Screen, Section, Segmented, Sheet, T, Toggle, s } from '../../ui/components';
import { C, F } from '../../ui/theme';

export default function Settings() {
  const d = useData();
  const st = d.settings;
  const { t } = useT();
  const [msg, setMsg] = useState('');
  const [askDelete, setAskDelete] = useState(false);
  const [pending, setPending] = useState<AppData | null>(null);
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 2500); };
  const set = <K extends keyof AppData['settings']>(k: K, v: AppData['settings'][K]) => update((x) => { x.settings[k] = v; });

  const [hh, mm] = st.reminderTime.split(':').map(Number);
  const shiftTime = (mins: number) => {
    const total = (((hh * 60 + mm + mins) % 1440) + 1440) % 1440;
    set('reminderTime', `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`);
  };

  return (
    <Screen title={t('nav_settings')}>
      <Pressable accessibilityRole="button" onPress={() => router.push('/language')}>
        <Card style={[s.row, s.between]}>
          <View style={{ flex: 1 }}>
            <T style={{ fontFamily: F.semibold }}>{t('language')}: {LANGUAGE_NAMES[st.lang]}</T>
            <T style={[s.xs, { marginTop: 2 }]}>{t('voice_lang')}: {LANGUAGE_NAMES[st.voiceLang]}</T>
          </View>
          <Icon name="chev" color={C.muted} size={18} />
        </Card>
      </Pressable>

      <Section title={t('voice_amount')} />
      <Card>
        <Segmented value={st.voiceAmount} onChange={(v) => set('voiceAmount', v)} options={[['full', t('va_full')], ['basic', t('va_basic')], ['off', t('va_off')]]} />
        <T style={[s.xs, { marginTop: 8, marginBottom: 14 }]}>{t('va_note')}</T>
        <T style={[s.xs, { fontFamily: F.semibold, marginBottom: 8 }]}>{t('volume')} · {Math.round(st.volume * 100)}%</T>
        <Segmented value={Math.round(st.volume * 4) / 4} onChange={(v) => set('volume', v)} options={[[0.25, '25%'], [0.5, '50%'], [0.75, '75%'], [1, '100%']]} />
        <T style={[s.xs, { fontFamily: F.semibold, marginTop: 14, marginBottom: 8 }]}>{t('countdown')}</T>
        <Segmented value={st.countdown} onChange={(v) => set('countdown', v)} options={[[0, t('off')], [3, `3 ${t('sec')}`], [5, `5 ${t('sec')}`]]} />
        <View style={{ marginTop: 8 }}>
          <Toggle label={t('vibration')} value={st.vibration} onChange={(v) => set('vibration', v)} />
          <Toggle label={t('km_voice')} value={st.kmVoice} onChange={(v) => set('kmVoice', v)} />
        </View>
        <Button kind="ghost" style={{ marginTop: 8 }} title={t('sound_test')} icon={<Icon name="speaker" size={18} />} onPress={() => {
          audio.tone('run', st.volume);
          audio.vibrate(st.vibration, [0, 200, 100, 200]);
          setTimeout(() => audio.speak(translate(st.voiceLang, 'sound_test_say'), st.voiceLang, st.volume), 500);
        }} />
      </Card>

      <Section title={t('music')} />
      <Card><T style={[s.small, s.muted, { lineHeight: 20 }]}>{t('music_text')}</T></Card>

      <Section title={t('reminders')} />
      <Card>
        <Toggle label={t('reminders')} sub={t('reminder_note')} value={st.reminders} onChange={async (v) => {
          if (v && !(await requestReminderPermission())) { flash(t('reminder_denied')); return; }
          set('reminders', v);
        }} />
        {st.reminders ? (
          <View style={[s.row, s.between, { marginTop: 10 }]}>
            <T style={[s.small, s.muted]}>{t('reminder_time')}</T>
            <View style={s.row}>
              <Button small kind="dark" title="−" onPress={() => shiftTime(-15)} />
              <T style={{ fontFamily: F.displayBold, fontSize: 26, minWidth: 74, textAlign: 'center' }}>{st.reminderTime}</T>
              <Button small kind="dark" title="+" onPress={() => shiftTime(15)} />
            </View>
          </View>
        ) : null}
      </Card>

      <Section title={t('data')} />
      <Card>
        <T style={[s.xs, { marginBottom: 12 }]}>{t('data_note')}</T>
        <View style={{ gap: 10 }}>
          <Button kind="dark" title={t('export')} onPress={async () => { try { await exportBackup(d); } catch { flash(t('export_err')); } }} />
          <Button kind="dark" title={t('import')} onPress={async () => {
            try { const b = await pickBackup(); if (b) setPending(b); } catch { flash(t('import_err')); }
          }} />
          <Button kind="danger" title={t('delete')} onPress={() => setAskDelete(true)} />
        </View>
        {msg ? <T style={{ color: C.lime, marginTop: 12, fontFamily: F.semibold }}>{msg}</T> : null}
      </Card>
      <T style={[s.xs, { textAlign: 'center', marginTop: 16 }]}>{t('privacy')}</T>

      <Sheet visible={askDelete} onClose={() => setAskDelete(false)} title={t('delete_q')} text={t('delete_text')}>
        <Button kind="danger" title={t('delete_yes')} onPress={async () => { setAskDelete(false); await deleteAll(); }} />
        <Button kind="ghost" title={t('cancel')} onPress={() => setAskDelete(false)} />
      </Sheet>
      <Sheet visible={!!pending} onClose={() => setPending(null)} title={t('import_q')} text={t('import_confirm')}>
        <Button title={t('import_yes')} onPress={() => { if (pending) replaceData(pending); setPending(null); flash(t('import_ok')); }} />
        <Button kind="ghost" title={t('cancel')} onPress={() => setPending(null)} />
      </Sheet>
    </Screen>
  );
}
