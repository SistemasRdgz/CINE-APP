import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { useAppDispatch } from '../redux/hooks';
import { cambiarTema } from '../redux/slices/preferenciasSlice';
import { useTheme } from './theme';
import Icon from './Icon';
import { guardarEstado } from '../redux/store';
import { useDialog } from './Dialog';
export default function ThemeToggle() {
  const { tema, colors } = useTheme();
  const dispatch = useAppDispatch();
  const dialog = useDialog();
  async function cambiar() {
    dispatch(cambiarTema(tema === 'oscuro' ? 'claro' : 'oscuro'));
    try { await guardarEstado(); }
    catch { dialog.alert('Preferencia sin guardar', 'El tema cambió, pero no se pudo guardar. Reintenta antes de cerrar la app.'); }
  }
  return <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Activar modo ${tema === 'oscuro' ? 'claro' : 'oscuro'}`} onPress={cambiar} style={{ minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center', marginHorizontal: 4 }}>
    <Icon name={tema === 'oscuro' ? 'white-balance-sunny' : 'weather-night'} color={colors.primary} size={22} />
    <Text style={{ color: colors.muted, fontSize: 9 }}>{tema === 'oscuro' ? 'Claro' : 'Oscuro'}</Text>
  </TouchableOpacity>;
}
