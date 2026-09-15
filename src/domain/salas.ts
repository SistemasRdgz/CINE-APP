import type { Sala } from '../types/sala';
export const FILAS_CINE = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
export const COLUMNAS_CINE = 10;
// Ampliación aditiva: conserva todos los identificadores previos y las funciones.
export function ampliarSala(sala: Sala): Sala {
  if (!['S1', 'S2'].includes(sala.id)) return sala;
  return { ...sala, filas: Array.from(new Set([...sala.filas, ...FILAS_CINE])), columnas: Math.max(sala.columnas, COLUMNAS_CINE) };
}
