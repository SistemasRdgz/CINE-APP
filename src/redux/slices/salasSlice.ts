import type { DatosSala } from '../../domain/salas';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Sala, Funcion } from '../../types/sala';
import { salasIniciales } from '../seedData';

interface SalasState {
  lista: Sala[];
}

const initialState: SalasState = {
  lista: salasIniciales,
};

const salasSlice = createSlice({
  name: 'salas',
  initialState,
  reducers: {
    agregarSala: (state, action: PayloadAction<DatosSala>) => {
      state.lista.push({ ...action.payload, funciones: [] });
    },
    editarSala: (state, action: PayloadAction<DatosSala>) => {
      const sala = state.lista.find(s => s.id === action.payload.id);
      if (sala) { sala.nombre = action.payload.nombre; sala.filas = action.payload.filas; sala.columnas = action.payload.columnas; }
    },
    eliminarSala: (state, action: PayloadAction<string>) => {
      state.lista = state.lista.filter(s => s.id !== action.payload);
    },
    agregarFuncion: (state, action: PayloadAction<Funcion>) => {
      const sala = state.lista.find((s) => s.id === action.payload.salaId);
      if (sala) {
        sala.funciones.push(action.payload);
      }
    },
  },
});

export const { agregarFuncion, agregarSala, editarSala, eliminarSala } = salasSlice.actions;
export default salasSlice.reducer;

// Helper puro (no es un thunk, se usa desde componentes con useAppSelector + find)
export const existeHorarioRepetido = (
  salas: Sala[],
  salaId: string,
  fecha: string,
  hora: string
): boolean => {
  const sala = salas.find((s) => s.id === salaId);
  if (!sala) return false;
  return sala.funciones.some((f) => f.fecha === fecha && f.hora === hora);
};
