import { colors } from '../ui/theme';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput } from '../ui/Typography';


interface Props {
  valor: string;
  onCambiar: (texto: string) => void;
  placeholder?: string;
}

export default function Buscador({ valor, onCambiar, placeholder }: Props) {
  return (
    <View style={styles.contenedor}>
      <TextInput
        style={styles.input}
        value={valor}
        onChangeText={onCambiar}
        placeholder={placeholder ?? 'Buscar por nombre, género, clasificación o sala...'}
        placeholderTextColor={colors.muted}
        autoCorrect={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    paddingHorizontal: 0,
    paddingTop: 12,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
});
