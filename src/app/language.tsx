import React from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LANGUAGE_NAMES } from '../i18n/strings';
import type { Lang } from '../core/types';
import { translate, update, useData, useT } from '../store/store';
import * as audio from '../services/audio';
import { Button, Icon, T, s } from '../ui/components';
import { Flag } from '../ui/Flag';
import { C, F } from '../ui/theme';

const LANGS = Object.keys(LANGUAGE_NAMES) as Lang[];

function List({ value, onPick, speakerTest, volume, testLabel }: { value: Lang; onPick: (l: Lang) => void; speakerTest?: boolean; volume: number; testLabel: string }) {
  return (
    <View style={{ backgroundColor: C.navy2, borderRadius: 16, paddingHorizontal: 16 }}>
      {LANGS.map((l, i) => (
        <Pressable key={l} accessibilityRole="radio" accessibilityState={{ selected: value === l }} onPress={() => onPick(l)}
          style={[s.row, { paddingVertical: 14 }, i > 0 && { borderTopWidth: 1, borderTopColor: C.line }]}>
          <Flag lang={l} width={30} />
          <T style={{ flex: 1, fontFamily: value === l ? F.bold : F.medium, fontSize: 16 }}>{LANGUAGE_NAMES[l]}</T>
          {speakerTest ? (
            <Pressable accessibilityRole="button" accessibilityLabel={testLabel} hitSlop={8} onPress={() => audio.speak(translate(l, 'sound_test_say'), l, volume)} style={{ padding: 4, marginRight: 8 }}>
              <Icon name="speaker" size={20} color={C.muted} />
            </Pressable>
          ) : null}
          <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: value === l ? C.lime : C.line, alignItems: 'center', justifyContent: 'center' }}>
            {value === l ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: C.lime }} /> : null}
          </View>
        </Pressable>
      ))}
    </View>
  );
}

/** Opened from the gear in the top-right corner: text and voice language, chosen separately. */
export default function LanguageScreen() {
  const d = useData();
  const { t } = useT();
  const ins = useSafeAreaInsets();
  const st = d.settings;

  return (
    <View style={{ flex: 1, backgroundColor: C.navy, paddingTop: Math.max(ins.top, 16) }}>
      <View style={[s.row, s.between, { paddingHorizontal: 20, marginBottom: 6 }]}>
        <T style={{ fontFamily: F.display, fontSize: 32, textTransform: 'uppercase' }}>{t('lang_title')}</T>
        <Pressable accessibilityRole="button" accessibilityLabel={t('close')} onPress={() => router.back()} hitSlop={10} style={s.gear}>
          <T style={{ fontSize: 18, fontFamily: F.bold }}>✕</T>
        </Pressable>
      </View>
      <View style={{ paddingHorizontal: 20, flex: 1 }}>
        <T style={[s.small, s.muted, { marginBottom: 6 }]}>{t('language_note')}</T>
        <T style={s.sec}>{t('language')}</T>
        <List volume={st.volume} testLabel={t('sound_test')} value={st.lang} onPick={(l) => update((x) => { x.settings.lang = l; x.onboarded = true; })} />
        <T style={s.sec}>{t('voice_lang')}</T>
        <List volume={st.volume} testLabel={t('sound_test')} value={st.voiceLang} speakerTest onPick={(l) => { update((x) => { x.settings.voiceLang = l; x.onboarded = true; }); audio.speak(translate(l, 'sound_test_say'), l, st.volume); }} />
        <View style={{ marginTop: 'auto', paddingBottom: Math.max(ins.bottom, 16) }}>
          <Button title={t('done_btn')} onPress={() => router.back()} />
        </View>
      </View>
    </View>
  );
}
