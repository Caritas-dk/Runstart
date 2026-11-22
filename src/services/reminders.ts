import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { AppData } from '../core/types';
import { translate } from '../store/store';

/** Local reminders only – nothing is sent over the network. */
const CHANNEL = 'training-reminders';
/** AndroidImportance.DEFAULT */
const ANDROID_IMPORTANCE_DEFAULT = 5;

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
});

/** 0=Mon … 6=Sun → expo weekday (1=Sun … 7=Sat) */
export const toExpoWeekday = (d: number) => ((d + 1) % 7) + 1;

export async function requestReminderPermission(): Promise<boolean> {
  try {
    const cur = await Notifications.getPermissionsAsync();
    if (cur.granted) return true;
    if (!cur.canAskAgain) return false;
    const r = await Notifications.requestPermissionsAsync();
    return r.granted;
  } catch {
    return false;
  }
}

/** Re-creates the reminder schedule from the current settings and training days. */
export async function syncReminders(d: AppData): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (!d.settings.reminders || !d.active) return;
    const ps = d.programs[d.active];
    if (!ps || ps.finished) return;
    const perm = await Notifications.getPermissionsAsync();
    if (!perm.granted) return;
    const lang = d.settings.lang;
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL, {
        name: translate(lang, 'notif_channel'),
        importance: ANDROID_IMPORTANCE_DEFAULT,
      });
    }
    const [hh, mm] = d.settings.reminderTime.split(':').map(Number);
    for (const day of ps.days) {
      await Notifications.scheduleNotificationAsync({
        content: { title: translate(lang, 'reminder_title'), body: translate(lang, 'reminder_body') },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: toExpoWeekday(day),
          hour: hh || 0,
          minute: mm || 0,
          channelId: Platform.OS === 'android' ? CHANNEL : undefined,
        },
      });
    }
  } catch {
    // reminders are optional – never break the app over them
  }
}
