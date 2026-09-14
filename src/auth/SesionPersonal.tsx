import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

const Contexto = createContext({ autorizado: false, entrar: () => {}, salir: () => {} });
// La sesión no se persiste: cada apertura requiere otra autenticación.
export function SesionPersonalProvider({ children }: { children: React.ReactNode }) {
  const [autorizado, setAutorizado] = useState(false);
  const anterior = useRef(AppState.currentState);
  useEffect(() => {
    const sub = AppState.addEventListener('change', estado => {
      if (estado === 'background' || (estado === 'active' && anterior.current === 'background')) setAutorizado(false);
      anterior.current = estado;
    });
    return () => sub.remove();
  }, []);
  return <Contexto.Provider value={{ autorizado, entrar: () => setAutorizado(true), salir: () => setAutorizado(false) }}>{children}</Contexto.Provider>;
}
export const useSesionPersonal = () => useContext(Contexto);
