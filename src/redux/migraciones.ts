import type { MigrationManifest } from 'redux-persist';
import type { CineRootState } from './rootReducer';
import { ampliarSala } from '../domain/salas';
export const migraciones: MigrationManifest = {
  1: state => {
    if (!state) return state;
    const anterior = state as CineRootState & typeof state;
    return { ...anterior, salas: { ...anterior.salas, lista: anterior.salas.lista.map(ampliarSala) } };
  },
};
