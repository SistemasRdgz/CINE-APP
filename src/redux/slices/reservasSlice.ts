import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Reserva } from '../../types/reserva';

interface ReservasState {
  lista: Reserva[];
}

const initialState: ReservasState = {
  lista: [],
};

const reservasSlice = createSlice({
  name: 'reservas',
  initialState,
  reducers: {
    agregarReserva: (state, action: PayloadAction<Reserva>) => {
      state.lista.push(action.payload);
    },
    marcarBoletoUsado: (state, action: PayloadAction<{ id: string; fechaUso: string }>) => {
      const reserva = state.lista.find((r) => r.id === action.payload.id);
      if (reserva && !reserva.usado) {
        reserva.usado = true;
        reserva.fechaUso = action.payload.fechaUso;
      }
    },
  },
});

export const { agregarReserva, marcarBoletoUsado } = reservasSlice.actions;
export default reservasSlice.reducer;

// Helper: asientos ya ocupados para una función específica
export const obtenerAsientosOcupados = (reservas: Reserva[], funcionId: string): string[] => {
  return reservas
    .filter((r) => r.funcionId === funcionId)
    .flatMap((r) => r.asientos);
};
