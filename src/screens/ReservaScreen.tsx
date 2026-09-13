import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAppSelector } from '../redux/hooks';
import { RootStackParamList } from '../navigation/types';
import { obtenerAsientosOcupados } from '../redux/slices/reservasSlice';

export default function ReservaScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Reserva'>>();
  const { peliculaCodigo } = route.params;

  const pelicula = useAppSelector((state) =>
    state.peliculas.lista.find((p) => p.codigo === peliculaCodigo)
  );
  const salas = useAppSelector((state) => state.salas.lista);
  const reservas = useAppSelector((state) => state.reservas.lista);

  const funciones = useMemo(() => {
    return salas.flatMap((s) =>
      s.funciones
        .filter((f) => f.peliculaCodigo === peliculaCodigo)
        .map((f) => ({ ...f, salaNombre: s.nombre, totalAsientos: s.filas.length * s.columnas }))
    );
  }, [salas, peliculaCodigo]);

  const [funcionSeleccionada, setFuncionSeleccionada] = useState<string | null>(
    funciones[0]?.id ?? null
  );
  const [cantidad, setCantidad] = useState(1);

  if (!pelicula) {
    return (
      <View style={styles.contenedor}>
        <Text style={styles.vacio}>Película no encontrada.</Text>
      </View>
    );
  }

  const funcionActual = funciones.find((f) => f.id === funcionSeleccionada);
  const asientosOcupados = funcionActual
    ? obtenerAsientosOcupados(reservas, funcionActual.id).length
    : 0;
  const asientosDisponibles = funcionActual
    ? funcionActual.totalAsientos - asientosOcupados
    : 0;

  const continuar = () => {
    if (!funcionActual) {
      Alert.alert('Selecciona una función', 'Debes elegir horario y sala para continuar.');
      return;
    }
    if (cantidad > asientosDisponibles) {
      Alert.alert(
        'Sin disponibilidad',
        `Solo quedan ${asientosDisponibles} asientos disponibles para esta función.`
      );
      return;
    }
    navigation.navigate('MapaAsientos', {
      funcionId: funcionActual.id,
      cantidad,
      peliculaCodigo,
    });
  };

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>{pelicula.nombre}</Text>
      <Text style={styles.subtitulo}>
        {pelicula.genero} · {pelicula.duracion} min · {pelicula.clasificacion} · $
        {pelicula.precio.toFixed(2)}
      </Text>

      <Text style={styles.seccion}>Selecciona función</Text>
      <FlatList
        data={funciones}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.vacio}>No hay funciones programadas para esta película.</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.funcion,
              funcionSeleccionada === item.id && styles.funcionActiva,
            ]}
            onPress={() => setFuncionSeleccionada(item.id)}
          >
            <Text
              style={[
                styles.funcionTexto,
                funcionSeleccionada === item.id && styles.funcionTextoActiva,
              ]}
            >
              {item.salaNombre} · {item.fecha} · {item.hora}
            </Text>
          </TouchableOpacity>
        )}
      />

      {funcionActual && (
        <Text style={styles.disponibilidad}>
          Asientos disponibles: {asientosDisponibles} / {funcionActual.totalAsientos}
        </Text>
      )}

      <Text style={styles.seccion}>Cantidad de boletos</Text>
      <View style={styles.stepper}>
        <TouchableOpacity
          style={styles.stepperBoton}
          onPress={() => setCantidad((c) => Math.max(1, c - 1))}
        >
          <Text style={styles.stepperTexto}>-</Text>
        </TouchableOpacity>
        <Text style={styles.stepperValor}>{cantidad}</Text>
        <TouchableOpacity
          style={styles.stepperBoton}
          onPress={() => setCantidad((c) => Math.min(10, c + 1))}
        >
          <Text style={styles.stepperTexto}>+</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.total}>Total estimado: ${(pelicula.precio * cantidad).toFixed(2)}</Text>

      <TouchableOpacity style={styles.botonContinuar} onPress={continuar}>
        <Text style={styles.botonContinuarTexto}>Seleccionar asientos</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#fff', padding: 16 },
  titulo: { fontSize: 20, fontWeight: '700' },
  subtitulo: { fontSize: 13, color: '#666', marginBottom: 12 },
  seccion: { fontSize: 14, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  vacio: { color: '#888', textAlign: 'center', marginTop: 12 },
  funcion: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    marginBottom: 8,
  },
  funcionActiva: { backgroundColor: '#1E3A8A' },
  funcionTexto: { fontSize: 14, color: '#333' },
  funcionTextoActiva: { color: '#fff', fontWeight: '600' },
  disponibilidad: { fontSize: 13, color: '#555', marginTop: 4 },
  stepper: { flexDirection: 'row', alignItems: 'center' },
  stepperBoton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperTexto: { fontSize: 20, color: '#1E3A8A', fontWeight: '700' },
  stepperValor: { fontSize: 18, fontWeight: '700', marginHorizontal: 20 },
  total: { fontSize: 16, fontWeight: '700', marginTop: 16 },
  botonContinuar: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  botonContinuarTexto: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
