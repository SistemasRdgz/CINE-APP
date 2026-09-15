import type { CineState } from './cine';
import type { Sala } from '../types/sala';
export const FILAS_CINE = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
export const COLUMNAS_CINE = 10;
// Ampliación aditiva: conserva todos los identificadores previos y las funciones.
export function ampliarSala(sala: Sala): Sala {
  if (!['S1', 'S2'].includes(sala.id)) return sala;
  return { ...sala, filas: Array.from(new Set([...sala.filas, ...FILAS_CINE])), columnas: Math.max(sala.columnas, COLUMNAS_CINE) };
}

export interface DatosSala { id: string; nombre: string; filas: string[]; columnas: number }
export function errorDatosSala(datos: DatosSala, salas: Sala[], editando: boolean): string | null {
  if (!/^[A-Z0-9-]{1,16}$/i.test(datos.id)) return 'Usa un código de hasta 16 letras, números o guiones.';
  if (!datos.nombre.trim()) return 'El nombre de la sala es obligatorio.';
  const existente = salas.find(s => s.id === datos.id);
  if (editando && !existente) return 'La sala ya no existe.';
  if (!editando && salas.some(s => s.id.toUpperCase() === datos.id.toUpperCase())) return 'Ya existe una sala con ese código.';
  if (salas.some(s => (!editando || s.id !== datos.id) && s.nombre.trim().toLowerCase() === datos.nombre.trim().toLowerCase())) return 'Ya existe una sala con ese nombre.';
  if (!Number.isInteger(datos.columnas) || datos.columnas < 1 || datos.columnas > 20) return 'Elige entre 1 y 20 asientos por fila.';
  if (datos.filas.length < 1 || datos.filas.length > 26 || new Set(datos.filas).size !== datos.filas.length || datos.filas.some(f => !/^[A-Z]$/.test(f))) return 'Elige entre 1 y 26 filas, identificadas sin repeticiones.';
  if (existente?.funciones.length && (existente.columnas !== datos.columnas || existente.filas.join(',') !== datos.filas.join(','))) return 'La sala tiene funciones: su distribución no se puede modificar. Puedes cambiar su nombre.';
  return null;
}
export function siguienteCodigoSala(salas: Sala[]): string {
  let n = 1;
  while (salas.some(s => s.id.toUpperCase() === `S${n}`)) n++;
  return `S${n}`;
}

export function errorEliminarSala(id: string, state: CineState): string | null {
  const sala = state.salas.lista.find(s => s.id === id);
  if (!sala) return 'La sala ya no existe.';
  if (sala.funciones.length || state.reservas.lista.some(r => r.salaId === id)) return 'No se puede eliminar una sala con funciones o reservas. Su historial debe conservarse.';
  if (state.peliculas.lista.some(p => p.salaAsignada === id)) return 'Hay películas asignadas a esta sala. Asigna otra sala a esas películas antes de eliminarla.';
  return null;
}
