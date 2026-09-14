import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSesionPersonal } from '../auth/SesionPersonal';
import { RootStackParamList } from '../navigation/types';

export default function PersonalHomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { salir } = useSesionPersonal();
  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>Zona de Personal</Text>
      <Text style={styles.subtitulo}>Acceso verificado. Selecciona una sección:</Text>

      <TouchableOpacity
        style={styles.opcion}
        onPress={() => navigation.navigate('PersonalPeliculas')}
      >
        <Text style={styles.opcionTexto}>🎬 Gestión de Películas</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.opcion}
        onPress={() => navigation.navigate('Dashboard')}
      >
        <Text style={styles.opcionTexto}>📊 Dashboard y Estadísticas</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.opcion}
        onPress={() => navigation.navigate('Escaner')}
      >
        <Text style={styles.opcionTexto}>📷 Validación de Boletos (QR)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.opcion} onPress={() => navigation.navigate('Funciones')}>
        <Text style={styles.opcionTexto}>Funciones y horarios</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.botonSalir}
        onPress={salir}
      >
        <Text style={styles.botonSalirTexto}>Salir de la Zona de Personal</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#fff', padding: 20 },
  titulo: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  subtitulo: { fontSize: 13, color: '#666', marginBottom: 20 },
  opcion: {
    backgroundColor: '#EEF2FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  opcionDeshabilitada: { backgroundColor: '#F3F4F6' },
  opcionTexto: { fontSize: 15, fontWeight: '600', color: '#1E3A8A' },
  proximamente: { fontSize: 11, color: '#999', marginTop: 2 },
  botonSalir: {
    marginTop: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonSalirTexto: { color: '#B91C1C', fontWeight: '600' },
});
