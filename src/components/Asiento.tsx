import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { EstadoAsiento } from '../types/asiento';

interface Props {
  id: string;
  estado: EstadoAsiento;
  onPress: () => void;
}

export default function Asiento({ id, estado, onPress }: Props) {
  const disabled = estado === 'Ocupado';

  return (
    <TouchableOpacity
      style={[
        styles.asiento,
        estado === 'Disponible' && styles.disponible,
        estado === 'Seleccionado' && styles.seleccionado,
        estado === 'Ocupado' && styles.ocupado,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Asiento ${id}: ${estado}`}
      accessibilityState={{ disabled, selected: estado === 'Seleccionado' }}
      disabled={disabled}
      onPress={onPress}
    >
      <Text
        style={[
          styles.texto,
          (estado === 'Seleccionado' || estado === 'Ocupado') && styles.textoClaro,
        ]}
      >
        {id}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  asiento: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
  },
  disponible: { backgroundColor: '#E5E7EB' },
  seleccionado: { backgroundColor: '#1E3A8A' },
  ocupado: { backgroundColor: '#9CA3AF' },
  texto: { fontSize: 12, fontWeight: '600', color: '#333' },
  textoClaro: { color: '#fff' },
});
