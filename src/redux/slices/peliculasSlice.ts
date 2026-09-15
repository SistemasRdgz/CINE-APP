import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { errorPelicula } from '../../domain/cine';
import { Pelicula } from '../../types/pelicula';
import { peliculasIniciales } from '../seedData';

interface PeliculasState {
  lista: Pelicula[];
}

const initialState: PeliculasState = {
  lista: peliculasIniciales,
};

const peliculasSlice = createSlice({
  name: 'peliculas',
  initialState,
  reducers: {
    agregarPelicula: (state, action: PayloadAction<Pelicula>) => {
      if (!errorPelicula(action.payload, state.lista)) state.lista.push(action.payload);
    },
    editarPelicula: (state, action: PayloadAction<Pelicula>) => {
      const idx = state.lista.findIndex((p) => p.codigo === action.payload.codigo);
      if (idx !== -1 && !errorPelicula(action.payload, state.lista, true)) {
        state.lista[idx] = action.payload;
      }
    },
    eliminarPelicula: (state, action: PayloadAction<string>) => {
      state.lista = state.lista.filter((p) => p.codigo !== action.payload);
    },
    toggleEstadoPelicula: (state, action: PayloadAction<string>) => {
      const pelicula = state.lista.find((p) => p.codigo === action.payload);
      if (pelicula) {
        pelicula.estado = pelicula.estado === 'Disponible' ? 'No disponible' : 'Disponible';
      }
    },
  },
});

export const { agregarPelicula, editarPelicula, eliminarPelicula, toggleEstadoPelicula } =
  peliculasSlice.actions;
export default peliculasSlice.reducer;
