import { combineReducers, UnknownAction } from '@reduxjs/toolkit';
import peliculas from './slices/peliculasSlice';
import reservas from './slices/reservasSlice';
import salas from './slices/salasSlice';
import { errorCompra, errorFuncion } from '../domain/cine';
import { agregarReserva } from './slices/reservasSlice';
import { agregarFuncion } from './slices/salasSlice';

const reducer = combineReducers({ peliculas, reservas, salas });
export type CineRootState = ReturnType<typeof reducer>;
// Las reglas entre slices se verifican de forma síncrona con el estado más reciente.
export default function rootReducer(state: CineRootState | undefined, action: UnknownAction): CineRootState {
  if (state && agregarReserva.match(action) && errorCompra(action.payload, state)) return state;
  if (state && agregarFuncion.match(action) && errorFuncion(action.payload, state)) return state;
  return reducer(state, action);
}
