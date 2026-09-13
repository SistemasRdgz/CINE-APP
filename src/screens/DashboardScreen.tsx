import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// NOTA: El Dashboard y Estadísticas (Módulo 6) se implementará en la
// siguiente entrega del proyecto. Esta pantalla es un placeholder para
// mantener la navegación completa de la Zona de Personal.
export default function DashboardScreen() {
  return (
    <View style={styles.contenedor}>
      <Text style={styles.texto}>📊 Dashboard y Estadísticas</Text>
      <Text style={styles.subtexto}>Este módulo se implementará próximamente.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  texto: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  subtexto: { fontSize: 14, color: '#888' },
});
