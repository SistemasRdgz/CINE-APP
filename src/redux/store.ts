import { migraciones } from './migraciones';
import { configureStore } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  persistStore,
  createMigrate,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';

import rootReducer from './rootReducer';
import { almacenamientoRecuperable } from './almacenamiento';

const almacenamiento = almacenamientoRecuperable(AsyncStorage);

const persistConfig = {
  key: 'cine-app-root',
  version: 1,
  migrate: createMigrate(migraciones),
  storage: almacenamiento,
  // Persistimos TODO el estado global de la app (obligatorio según indicaciones).
  whitelist: ['peliculas', 'reservas', 'salas', 'preferencias'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

export async function guardarEstado() {
  await persistor.flush();
  await almacenamiento.verificar();
}
