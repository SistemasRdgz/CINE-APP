import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { EstadoAsiento } from '../types/asiento';
import Icon from '../ui/Icon';
import { useTheme, Palette } from '../ui/theme';
export default function Asiento({ id, estado, onPress }: { id: string; estado: EstadoAsiento; onPress: () => void }) {
  const { colors: c } = useTheme();
  const s = React.useMemo(() => makeStyles(c), [c]);

  const ocupado = estado === 'Ocupado', seleccionado = estado === 'Seleccionado';
  return <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Asiento ${id}: ${estado}`} accessibilityState={{ disabled: ocupado, selected: seleccionado }} disabled={ocupado} onPress={onPress} style={[s.seat, ocupado && s.occupied, seleccionado && s.selected]}>
    <Icon name={ocupado ? 'close' : 'seat-outline'} size={25} color={seleccionado ? c.primaryText : ocupado ? c.danger : c.muted} />
    <Text style={[s.label, seleccionado && { color: c.primaryText }]}>{id}</Text>
  </TouchableOpacity>;
}
const makeStyles = (c: Palette) => StyleSheet.create({ seat: { width: 44, minHeight: 54, margin: 3, borderRadius: 9, borderWidth: 1, borderColor: c.border, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center', paddingVertical: 4 },
  selected: { backgroundColor: c.primary, borderColor: c.primary }, occupied: { backgroundColor: c.wineSoft, borderColor: c.wine }, label: { color: c.muted, fontSize: 10, fontWeight: '600', marginTop: 2 } });
