import { DarkTheme } from '@react-navigation/native';
export const colors = {
  background: '#111114', surface: '#1D1D24', raised: '#282831', border: '#3B3B45',
  primary: '#D9B776', primaryText: '#171410', wine: '#8B2635', wineSoft: '#392029',
  text: '#F5F1EA', muted: '#B6B2BC', success: '#8ED1AE', danger: '#FF9DA9',
};
export const navigationTheme = { ...DarkTheme, colors: { ...DarkTheme.colors,
  primary: colors.primary, background: colors.background, card: colors.background,
  text: colors.text, border: colors.border, notification: colors.wine,
} };
