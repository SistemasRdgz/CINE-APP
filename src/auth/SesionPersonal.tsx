import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

interface Sesion { autorizado: boolean; entrar: () => void; salir: () => void; interaccionNativa: <T>(tarea: () => Promise<T>) => Promise<T> }
const Contexto = createContext<Sesion>({ autorizado: false, entrar: () => {}, salir: () => {}, interaccionNativa: tarea => tarea() });
// La sesión no se persiste: cada apertura requiere otra autenticación.
export function SesionPersonalProvider({ children }: { children: React.ReactNode }) {
  const [autorizado, setAutorizado] = useState(false);
  const enSelector = useRef(false);
  const retornoPendiente = useRef(false);
  const anterior = useRef(AppState.currentState);
  useEffect(() => {
    const sub = AppState.addEventListener('change', estado => {
      if (!enSelector.current && (estado === 'background' || (estado === 'active' && anterior.current === 'background'))) setAutorizado(false);
      if (estado === 'active' && retornoPendiente.current) { enSelector.current = false; retornoPendiente.current = false; }
      anterior.current = estado;
    });
    return () => sub.remove();
  }, []);
  async function interaccionNativa<T>(tarea: () => Promise<T>): Promise<T> {
    enSelector.current = true;
    try { return await tarea(); }
    finally {
      if (AppState.currentState === 'active') { enSelector.current = false; }
      else retornoPendiente.current = true;
      anterior.current = AppState.currentState;
    }
  }
  return <Contexto.Provider value={{ autorizado, entrar: () => setAutorizado(true), salir: () => setAutorizado(false), interaccionNativa }}>{children}</Contexto.Provider>;
}
export const useSesionPersonal = () => useContext(Contexto);
