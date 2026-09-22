import { File, Directory, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as Crypto from 'expo-crypto';
import type { Attachment } from '../types';

const DIR = new Directory(Paths.document, 'attachments');

export async function pickImage(): Promise<Attachment | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) throw new Error('Photo library permission denied');

  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.7,
  });
  if (res.canceled) return null;

  const asset = res.assets[0];

  // создаём папку, если её нет
  if (!DIR.exists) DIR.create({ intermediates: true });

  const ext = asset.uri.split('.').pop()?.split('?')[0] || 'jpg';
  const filename = `${Crypto.randomUUID()}.${ext}`;
  const dest = new File(DIR, filename);

  // копируем выбранный файл в постоянную директорию
  const src = new File(asset.uri);
  src.copy(dest);

  return {
    id: Crypto.randomUUID(),
    uri: dest.uri,
    name: asset.fileName ?? filename,
    mimeType: asset.mimeType ?? 'image/jpeg',
    size: asset.fileSize,
  };
}

export async function attachmentExists(uri: string): Promise<boolean> {
  try {
    const f = new File(uri);
    return f.exists;
  } catch {
    return false;
  }
}