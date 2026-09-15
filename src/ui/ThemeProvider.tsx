import React, { useMemo } from 'react';
import { useAppSelector } from '../redux/hooks';
import { ThemeContext, darkColors, lightColors } from './theme';
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const tema = useAppSelector(s => s.preferencias.tema);
  const value = useMemo(() => ({ tema, colors: tema === 'claro' ? lightColors : darkColors }), [tema]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
