import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SystemUI from 'expo-system-ui';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { BarlowCondensed_700Bold } from '@expo-google-fonts/barlow-condensed/700Bold';
import { BarlowCondensed_800ExtraBold } from '@expo-google-fonts/barlow-condensed/800ExtraBold';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { loadData, useData, useT } from '../store/store';
import { prepareAudio } from '../services/audio';
import { syncReminders } from '../services/reminders';
import { getInterrupted, resumeInterrupted, saveInterruptedAsPartial } from '../services/workout';
// importing this module also registers the background location task at startup
import { ensureLocationPermission } from '../services/location';
import { Button, Sheet } from '../ui/components';
import { C } from '../ui/theme';
import { SplashOverlay } from '../ui/SplashOverlay';

SystemUI.setBackgroundColorAsync(C.navy).catch(() => {});
// Keep the native "RUNSTART 0-GOAL" splash until the in-app splash (identical) is on screen.
SplashScreen.preventAutoHideAsync().catch(() => {});

type Interrupted = NonNullable<Awaited<ReturnType<typeof getInterrupted>>>;

export default function RootLayout() {
  const [fonts] = useFonts({ BarlowCondensed_700Bold, BarlowCondensed_800ExtraBold, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  const [ready, setReady] = useState(false);
  const [interrupted, setInterrupted] = useState<Interrupted | null>(null);

  useEffect(() => {
    (async () => {
      await loadData();
      void prepareAudio();
      setInterrupted(await getInterrupted());
      setReady(true);
    })();
  }, []);

  if (!fonts || !ready) {
    return <View style={{ flex: 1, backgroundColor: C.navy, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={C.lime} /></View>;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <ReminderSync />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.navy }, animation: 'slide_from_right' }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="workout" options={{ gestureEnabled: false, animation: 'fade', presentation: 'fullScreenModal' }} />
        <Stack.Screen name="summary" options={{ gestureEnabled: false, animation: 'fade' }} />
        <Stack.Screen name="language" options={{ presentation: 'modal' }} />
      </Stack>
      {interrupted ? <InterruptedPrompt saved={interrupted} onDone={() => setInterrupted(null)} /> : null}
      <SplashOverlay onShown={() => { SplashScreen.hideAsync().catch(() => {}); }} />
    </SafeAreaProvider>
  );
}

/** Keeps the local reminder schedule in step with settings and training days. */
function ReminderSync() {
  const d = useData();
  const ps = d.active ? d.programs[d.active] : undefined;
  const key = [d.settings.reminders, d.settings.reminderTime, d.settings.lang, d.active, ps?.days.join(','), ps?.finished].join('|');
  useEffect(() => { void syncReminders(d); }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

function InterruptedPrompt({ saved, onDone }: { saved: Interrupted; onDone: () => void }) {
  const { t } = useT();
  return (
    <Sheet visible onClose={() => {}} title={t('resume_q')} text={t('resume_text')}>
      <Button title={t('resume_yes')} onPress={async () => {
        onDone();
        const gps = saved.env === 'outdoor' ? (await ensureLocationPermission()) === 'granted' : false;
        await resumeInterrupted(saved, gps);
        router.push('/workout');
      }} />
      <Button kind="ghost" title={t('resume_save')} onPress={async () => {
        onDone();
        await saveInterruptedAsPartial(saved);
        router.push('/summary');
      }} />
    </Sheet>
  );
}
