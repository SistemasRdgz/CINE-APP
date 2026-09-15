import { createContext, useContext } from 'react';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import type { Tema } from '../redux/slices/preferenciasSlice';
export const darkColors = {
  background: '#111114', surface: '#1D1D24', raised: '#282831', border: '#3B3B45',
  primary: '#D9B776', primaryText: '#171410', wine: '#8B2635', wineSoft: '#392029',
  text: '#F5F1EA', muted: '#B6B2BC', success: '#8ED1AE', danger: '#FF9DA9',
};
export type Palette = typeof darkColors;
export const lightColors: Palette = {
  background: '#F7F3EC', surface: '#FFFFFF', raised: '#EEE6D9', border: '#D1C5B5',
  primary: '#79551A', primaryText: '#FFFFFF', wine: '#8B2635', wineSoft: '#F5E5E7',
  text: '#242128', muted: '#655D68', success: '#226543', danger: '#AA243E',
};
export const ThemeContext = createContext<{ colors: Palette; tema: Tema }>({ colors: darkColors, tema: 'oscuro' });
export const useTheme = () => useContext(ThemeContext);
export function getNavigationTheme(tema: Tema, colors: Palette) {
  const base = tema === 'oscuro' ? DarkTheme : DefaultTheme;
  return { ...base, colors: { ...base.colors,
    primary: colors.primary, background: colors.background, card: colors.background,
    text: colors.text, border: colors.border, notification: colors.wine,
  } };
}
