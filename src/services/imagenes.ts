import * as FileSystem from 'expo-file-system';
import { nanoid } from '@reduxjs/toolkit';
// Se guarda un nombre relativo: los directorios de la instalación pueden cambiar.
export function uriPoster(imagen?: string): string | undefined {
  if (!imagen || !FileSystem.documentDirectory) return undefined;
  return `${FileSystem.documentDirectory}posters/${imagen}`;
}
export async function guardarPoster(uri: string): Promise<string> {
  if (!FileSystem.documentDirectory) throw new Error('Almacenamiento local no disponible.');
  const directorio = `${FileSystem.documentDirectory}posters/`;
  await FileSystem.makeDirectoryAsync(directorio, { intermediates: true });
  const extension = uri.split('?')[0].match(/\.(jpe?g|png|webp|heic)$/i)?.[1] ?? 'jpg';
  const nombre = `${nanoid()}.${extension}`;
  await FileSystem.copyAsync({ from: uri, to: `${directorio}${nombre}` });
  return nombre;
}
