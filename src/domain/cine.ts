import { Pelicula } from '../types/pelicula';
import { Reserva } from '../types/reserva';
import { Sala, Funcion } from '../types/sala';

export interface CineState {
  peliculas: { lista: Pelicula[] };
  reservas: { lista: Reserva[] };
  salas: { lista: Sala[] };
}
export const normalizar = (s: string) => s.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export const fechaLocal = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export function fechaValida(fecha: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
  const d = new Date(`${fecha}T12:00:00`);
  return !Number.isNaN(d.getTime()) && fechaLocal(d) === fecha;
}
export const funcionFutura = (f: Funcion, ahora = new Date()) =>
  new Date(`${f.fecha}T${f.hora}:00`).getTime() > ahora.getTime();

export function errorPelicula(p: Pelicula, lista: Pelicula[], editando = false): string | null {
  if (!p.codigo.trim() || !p.nombre.trim()) return 'Código y nombre son obligatorios.';
  if (!editando && lista.some(x => normalizar(x.codigo) === normalizar(p.codigo))) return 'Ya existe una película con ese código.';
  if (!p.genero.trim() || !p.clasificacion.trim() || !p.salaAsignada) return 'Completa género, clasificación y sala.';
  if (!Number.isFinite(p.precio) || p.precio < 0) return 'El precio debe ser un número mayor o igual a cero.';
  if (!Number.isInteger(p.duracion) || p.duracion <= 0) return 'La duración debe ser un número entero positivo.';
  if (!['Disponible', 'No disponible'].includes(p.estado)) return 'Estado de película inválido.';
  return null;
}
export function errorFuncion(f: Funcion, state: CineState): string | null {
  const sala = state.salas.lista.find(s => s.id === f.salaId);
  const pelicula = state.peliculas.lista.find(p => p.codigo === f.peliculaCodigo);
  if (!sala || !pelicula) return 'Selecciona una película y una sala válidas.';
  if (pelicula.salaAsignada !== sala.id) return 'La función debe usar la sala asignada a la película.';
  if (!fechaValida(f.fecha) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(f.hora)) return 'Usa una fecha válida (AAAA-MM-DD) y una hora válida (HH:MM).';
  if (!funcionFutura(f)) return 'La función debe programarse para una fecha y hora futuras.';
  if (state.salas.lista.some(s => s.funciones.some(x => x.id === f.id))) return 'Ya existe una función con ese identificador.';
  if (sala.funciones.some(x => x.fecha === f.fecha && x.hora === f.hora)) return 'Ya hay una función con ese horario en la misma sala.';
  return null;
}
export function errorCompra(r: Reserva, state: CineState): string | null {
  const p = state.peliculas.lista.find(p => p.codigo === r.peliculaCodigo);
  const sala = state.salas.lista.find(s => s.id === r.salaId);
  const f = sala?.funciones.find(f => f.id === r.funcionId);
  if (!p || p.estado !== 'Disponible' || !sala || !f || f.peliculaCodigo !== p.codigo) return 'La película o función ya no está disponible.';
  if (!funcionFutura(f)) return 'Esta función ya comenzó. Elige otra función.';
  if (!r.cliente.nombre.trim()) return 'El nombre del cliente es obligatorio.';
  if (r.cliente.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.cliente.email)) return 'Escribe un correo válido o deja ese campo vacío.';
  if (!Number.isInteger(r.cantidadBoletos) || r.cantidadBoletos < 1 || r.asientos.length !== r.cantidadBoletos || new Set(r.asientos).size !== r.asientos.length) return 'Selecciona exactamente la cantidad de asientos indicada, sin repetirlos.';
  const validos = new Set(sala.filas.flatMap(fila => Array.from({ length: sala.columnas }, (_, i) => `${fila}${i + 1}`)));
  if (r.asientos.some(a => !validos.has(a))) return 'Uno de los asientos no pertenece a esta sala.';
  if (state.reservas.lista.some(x => x.id === r.id)) return 'Esta compra ya fue registrada.';
  if (state.reservas.lista.some(x => x.funcionId === f.id && x.asientos.some(a => r.asientos.includes(a)))) return 'Uno de los asientos ya fue comprado. Selecciona otros asientos.';
  if (!Number.isFinite(r.total) || Math.round(r.total * 100) !== Math.round(p.precio * r.cantidadBoletos * 100)) return 'El precio cambió. Vuelve a seleccionar la función.';
  return null;
}
// El QR solo identifica la reserva: nunca se confía en un precio/estado recibido por cámara.
export const contenidoQR = (id: string) => `CINEAPP:1:${id}`;
export function leerQR(data: string): string | null {
  const match = /^CINEAPP:1:(BOL-[A-Z0-9-]{6,80})$/.exec(data);
  return match?.[1] ?? null;
}
export function estadisticas(state: CineState) {
  const { peliculas, salas, reservas } = state;
  const funciones = salas.lista.flatMap(s => s.funciones);
  let capacidad = 0, ocupados = 0;
  for (const s of salas.lista) for (const f of s.funciones) {
    capacidad += s.filas.length * s.columnas;
    ocupados += new Set(reservas.lista.filter(r => r.funcionId === f.id).flatMap(r => r.asientos)).size;
  }
  const conteo = new Map<string, { nombre: string; boletos: number }>();
  for (const r of reservas.lista) {
    const anterior = conteo.get(r.peliculaCodigo);
    conteo.set(r.peliculaCodigo, { nombre: peliculas.lista.find(p => p.codigo === r.peliculaCodigo)?.nombre ?? r.peliculaNombre, boletos: (anterior?.boletos ?? 0) + r.cantidadBoletos });
  }
  const maximo = Math.max(0, ...Array.from(conteo.values()).map(x => x.boletos));
  return {
    peliculas: peliculas.lista.length, funciones: funciones.length,
    boletos: reservas.lista.reduce((n, r) => n + r.cantidadBoletos, 0),
    ocupados, disponibles: capacidad - ocupados,
    ingresos: reservas.lista.reduce((n, r) => n + Math.round(r.total * 100), 0) / 100,
    masReservadas: Array.from(conteo.values()).filter(x => x.boletos === maximo),
  };
}
