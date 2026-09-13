import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import Asiento from '../components/Asiento';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { agregarReserva, obtenerAsientosOcupados } from '../redux/slices/reservasSlice';
import { RootStackParamList } from '../navigation/types';
import { EstadoAsiento } from '../types/asiento';

function generarCodigoReserva(): string {
  return 'BOL-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function MapaAsientosScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'MapaAsientos'>>();
  const { funcionId, cantidad, peliculaCodigo } = route.params;

  const dispatch = useAppDispatch();
  const pelicula = useAppSelector((state) =>
    state.peliculas.lista.find((p) => p.codigo === peliculaCodigo)
  );
  const salas = useAppSelector((state) => state.salas.lista);
  const reservas = useAppSelector((state) => state.reservas.lista);

  const sala = salas.find((s) => s.funciones.some((f) => f.id === funcionId));
  const funcion = sala?.funciones.find((f) => f.id === funcionId);

  const asientosOcupadosIds = useMemo(
    () => new Set(obtenerAsientosOcupados(reservas, funcionId)),
    [reservas, funcionId]
  );

  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [nombreCliente, setNombreCliente] = useState('');
  const [emailCliente, setEmailCliente] = useState('');
  const [error, setError] = useState('');

  if (!pelicula || !sala || !funcion) {
    return (
      <View style={styles.contenedor}>
        <Text style={styles.vacio}>No se pudo cargar la información de la función.</Text>
      </View>
    );
  }

  const estadoDe = (id: string): EstadoAsiento => {
    if (asientosOcupadosIds.has(id)) return 'Ocupado';
    if (seleccionados.includes(id)) return 'Seleccionado';
    return 'Disponible';
  };

  const toggleAsiento = (id: string) => {
    if (asientosOcupadosIds.has(id)) return;
    setSeleccionados((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id);
      if (prev.length >= cantidad) {
        Alert.alert('Límite alcanzado', `Solo puedes seleccionar ${cantidad} asiento(s).`);
        return prev;
      }
      return [...prev, id];
    });
  };

  const total = pelicula.precio * cantidad;

  const confirmarCompra = () => {
    if (seleccionados.length !== cantidad) {
      setError(`Debes seleccionar exactamente ${cantidad} asiento(s).`);
      return;
    }
    if (!nombreCliente.trim()) {
      setError('El nombre del cliente es obligatorio.');
      return;
    }
    setError('');

    dispatch(
      agregarReserva({
        id: generarCodigoReserva(),
        funcionId: funcion.id,
        peliculaCodigo: pelicula.codigo,
        peliculaNombre: pelicula.nombre,
        salaId: sala.id,
        salaNombre: sala.nombre,
        fecha: funcion.fecha,
        hora: funcion.hora,
        asientos: seleccionados,
        cantidadBoletos: cantidad,
        total,
        cliente: { nombre: nombreCliente.trim(), email: emailCliente.trim() || undefined },
        fechaCompra: new Date().toISOString(),
        usado: false,
      })
    );

    Alert.alert('Compra confirmada', 'Tu boleto se guardó en "Mis Boletos".', [
      {
        text: 'OK',
        onPress: () =>
          navigation.reset({
            index: 0,
            routes: [{ name: 'ClienteTabs' }],
          }),
      },
    ]);
  };

  return (
    <ScrollView style={styles.contenedor} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.titulo}>{pelicula.nombre}</Text>
      <Text style={styles.subtitulo}>
        {sala.nombre} · {funcion.fecha} · {funcion.hora}
      </Text>

      <View style={styles.pantalla}>
        <Text style={styles.pantallaTexto}>PANTALLA</Text>
      </View>

      <View style={styles.mapa}>
        {sala.filas.map((fila) => (
          <View key={fila} style={styles.filaAsientos}>
            {Array.from({ length: sala.columnas }, (_, i) => {
              const id = `${fila}${i + 1}`;
              return <Asiento key={id} id={id} estado={estadoDe(id)} onPress={() => toggleAsiento(id)} />;
            })}
          </View>
        ))}
      </View>

      <View style={styles.leyenda}>
        <Leyenda color="#E5E7EB" texto="Disponible" />
        <Leyenda color="#1E3A8A" texto="Seleccionado" />
        <Leyenda color="#9CA3AF" texto="Ocupado" />
      </View>

      <Text style={styles.seccion}>
        Seleccionados: {seleccionados.join(', ') || 'ninguno'} ({seleccionados.length}/{cantidad})
      </Text>

      <Text style={styles.seccion}>Datos del cliente</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre completo *"
        value={nombreCliente}
        onChangeText={setNombreCliente}
      />
      <TextInput
        style={styles.input}
        placeholder="Correo (opcional)"
        value={emailCliente}
        onChangeText={setEmailCliente}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {error !== '' && <Text style={styles.error}>{error}</Text>}

      <Text style={styles.total}>Total a pagar: ${total.toFixed(2)}</Text>

      <TouchableOpacity style={styles.botonConfirmar} onPress={confirmarCompra}>
        <Text style={styles.botonConfirmarTexto}>Confirmar compra</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Leyenda({ color, texto }: { color: string; texto: string }) {
  return (
    <View style={styles.leyendaItem}>
      <View style={[styles.leyendaColor, { backgroundColor: color }]} />
      <Text style={styles.leyendaTexto}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#fff' },
  vacio: { color: '#888', textAlign: 'center', marginTop: 40 },
  titulo: { fontSize: 18, fontWeight: '700' },
  subtitulo: { fontSize: 13, color: '#666', marginBottom: 12 },
  pantalla: {
    backgroundColor: '#333',
    paddingVertical: 6,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 16,
  },
  pantallaTexto: { color: '#fff', fontSize: 11, letterSpacing: 2 },
  mapa: { alignItems: 'center', marginBottom: 12 },
  filaAsientos: { flexDirection: 'row' },
  leyenda: { flexDirection: 'row', justifyContent: 'center', marginBottom: 16 },
  leyendaItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 8 },
  leyendaColor: { width: 12, height: 12, borderRadius: 3, marginRight: 4 },
  leyendaTexto: { fontSize: 12, color: '#555' },
  seccion: { fontSize: 14, fontWeight: '700', marginTop: 8, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 10,
  },
  error: { color: '#B91C1C', marginBottom: 8, fontSize: 13 },
  total: { fontSize: 17, fontWeight: '700', marginTop: 8 },
  botonConfirmar: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  botonConfirmarTexto: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
