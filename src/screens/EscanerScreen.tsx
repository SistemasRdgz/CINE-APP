import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// NOTA: La validación de boletos por escáner QR (Módulo 7) se implementará
// en la siguiente entrega, integrando expo-camera para lectura real de QR.
export default function EscanerScreen() {
  return (
    <View style={styles.contenedor}>
      <Text style={styles.texto}>📷 Validación de Boletos (QR)</Text>
      <Text style={styles.subtexto}>Este módulo se implementará próximamente.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  texto: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  subtexto: { fontSize: 14, color: '#888' },
});
