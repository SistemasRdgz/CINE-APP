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
    agregarFuncion: (state, action: PayloadAction<Funcion>) => {
      const sala = state.lista.find((s) => s.id === action.payload.salaId);
      if (sala) {
        sala.funciones.push(action.payload);
      }
    },
  },
});

export const { agregarFuncion } = salasSlice.actions;
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
