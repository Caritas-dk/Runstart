import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { parseBackup, serializeBackup } from '../core/backup';
import type { AppData } from '../core/types';

/** Writes a JSON backup to a file and opens the share sheet (save to Files, Drive, mail …). */
export async function exportBackup(d: AppData): Promise<void> {
  const stamp = new Date().toISOString().slice(0, 10);
  const file = new File(Paths.cache, `runstart-backup-${stamp}.json`);
  file.create({ overwrite: true });
  file.write(serializeBackup(d));
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: 'Runstart backup', UTI: 'public.json' });
  }
}

/** Opens the file picker; returns parsed data, null when cancelled, throws on invalid file. */
export async function pickBackup(): Promise<AppData | null> {
  const res = await File.pickFileAsync({ mimeTypes: ['application/json', 'text/plain', '*/*'] });
  if (res.canceled || !res.result) return null;
  const text = await res.result.text();
  return parseBackup(text);
}
