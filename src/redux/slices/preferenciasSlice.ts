import { createSlice, PayloadAction } from '@reduxjs/toolkit';
export type Tema = 'oscuro' | 'claro';
const slice = createSlice({
  name: 'preferencias', initialState: { tema: 'oscuro' as Tema },
  reducers: { cambiarTema(state, action: PayloadAction<Tema>) { state.tema = action.payload; } },
});
export const { cambiarTema } = slice.actions;
export default slice.reducer;
