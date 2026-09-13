import { combineReducers, configureStore } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';

import peliculasReducer from './slices/peliculasSlice';
import reservasReducer from './slices/reservasSlice';
import salasReducer from './slices/salasSlice';

const rootReducer = combineReducers({
  peliculas: peliculasReducer,
  reservas: reservasReducer,
  salas: salasReducer,
});

const persistConfig = {
  key: 'cine-app-root',
  storage: AsyncStorage,
  // Persistimos TODO el estado global de la app (obligatorio según indicaciones).
  whitelist: ['peliculas', 'reservas', 'salas'],
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
