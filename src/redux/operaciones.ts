import type { ThunkAction, UnknownAction } from '@reduxjs/toolkit';
import type { RootState } from './store';
import type { Reserva } from '../types/reserva';
import type { Funcion } from '../types/sala';
import { agregarReserva, marcarBoletoUsado } from './slices/reservasSlice';
import { agregarFuncion } from './slices/salasSlice';
import { errorCompra, errorFuncion, leerQR } from '../domain/cine';

type Resultado = { ok: true; mensaje: string } | { ok: false; mensaje: string };
type Operacion = ThunkAction<Resultado, RootState, unknown, UnknownAction>;
export const comprar = (reserva: Reserva): Operacion => (dispatch, getState) => {
  const error = errorCompra(reserva, getState());
  if (error) return { ok: false, mensaje: error };
  dispatch(agregarReserva(reserva));
  return { ok: true, mensaje: 'Compra registrada.' };
};
export const programarFuncion = (funcion: Funcion): Operacion => (dispatch, getState) => {
  const error = errorFuncion(funcion, getState());
  if (error) return { ok: false, mensaje: error };
  dispatch(agregarFuncion(funcion));
  return { ok: true, mensaje: 'Función programada.' };
};
export const validarQR = (data: string): Operacion => (dispatch, getState) => {
  const id = leerQR(data);
  if (!id) return { ok: false, mensaje: 'Este QR no es un boleto de CineApp.' };
  const reserva = getState().reservas.lista.find(r => r.id === id);
  if (!reserva) return { ok: false, mensaje: 'No existe esta reserva en este dispositivo.' };
  if (reserva.usado) return { ok: false, mensaje: 'Este boleto ya fue utilizado. No se permite otro ingreso.' };
  dispatch(marcarBoletoUsado({ id, fechaUso: new Date().toISOString() }));
  return { ok: true, mensaje: `${reserva.peliculaNombre}\n${reserva.salaNombre} · ${reserva.fecha} ${reserva.hora}\nAsientos: ${reserva.asientos.join(', ')}\n${reserva.cantidadBoletos} entrada(s) validada(s).` };
};
