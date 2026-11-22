import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';
import type { GpsPoint } from '../core/gps';

/**
 * GPS is only ever started for outdoor sessions. Treadmill sessions never
 * touch location services.
 */
export const LOCATION_TASK = 'runstart-location';

type Listener = (p: GpsPoint) => void;
let listener: Listener | null = null;

// Must be defined at module top level so it exists when the OS wakes the app.
try {
  TaskManager.defineTask(LOCATION_TASK, async ({ data, error }) => {
  if (error || !data) return;
  const { locations } = data as { locations: Location.LocationObject[] };
  for (const l of locations || []) {
    listener?.({ lat: l.coords.latitude, lon: l.coords.longitude, t: l.timestamp, acc: l.coords.accuracy, speed: l.coords.speed });
  }
  });
} catch {
  // not supported on this platform (web preview) – foreground fallback is used
}

export type LocationResult = 'granted' | 'denied' | 'unavailable';

export async function ensureLocationPermission(): Promise<LocationResult> {
  try {
    if (!(await Location.hasServicesEnabledAsync())) return 'unavailable';
    const cur = await Location.getForegroundPermissionsAsync();
    if (cur.granted) return 'granted';
    if (!cur.canAskAgain) return 'denied';
    const res = await Location.requestForegroundPermissionsAsync();
    return res.granted ? 'granted' : 'denied';
  } catch {
    return 'unavailable';
  }
}

export async function startTracking(onPoint: Listener, notifTitle: string, notifBody: string): Promise<boolean> {
  listener = onPoint;
  try {
    if (await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK)) await Location.stopLocationUpdatesAsync(LOCATION_TASK);
  } catch {}
  try {
    await Location.startLocationUpdatesAsync(LOCATION_TASK, {
      accuracy: Location.Accuracy.BestForNavigation,
      timeInterval: 1000,
      distanceInterval: 0,
      activityType: Location.ActivityType.Fitness,
      pausesUpdatesAutomatically: false,
      showsBackgroundLocationIndicator: true,
      foregroundService: Platform.OS === 'android' ? { notificationTitle: notifTitle, notificationBody: notifBody, notificationColor: '#0B1F3A' } : undefined,
    });
    return true;
  } catch {
    // Fallback: foreground-only updates (e.g. web, or background mode unavailable)
    try {
      fallbackSub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 1000, distanceInterval: 0 },
        (l) => listener?.({ lat: l.coords.latitude, lon: l.coords.longitude, t: l.timestamp, acc: l.coords.accuracy, speed: l.coords.speed }),
      );
      return true;
    } catch {
      return false;
    }
  }
}

let fallbackSub: Location.LocationSubscription | null = null;

export async function stopTracking() {
  listener = null;
  try { fallbackSub?.remove(); } catch {}
  fallbackSub = null;
  try {
    if (await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK)) await Location.stopLocationUpdatesAsync(LOCATION_TASK);
  } catch {}
}

export function openAppSettings() {
  void import('react-native').then(({ Linking }) => Linking.openSettings()).catch(() => {});
}
