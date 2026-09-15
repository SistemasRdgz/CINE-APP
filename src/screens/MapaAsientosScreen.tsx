import Icon from '../ui/Icon';
import { useTheme, Palette } from '../ui/theme';
import React, { useMemo, useState, useRef } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, TextInput } from '../ui/Typography';
import { useDialog } from '../ui/Dialog';

import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { nanoid } from '@reduxjs/toolkit';
import { comprar } from '../redux/operaciones';
import { guardarEstado } from '../redux/store';
import Asiento from '../components/Asiento';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { obtenerAsientosOcupados } from '../redux/slices/reservasSlice';
import { RootStackParamList } from '../navigation/types';
import { EstadoAsiento } from '../types/asiento';

function generarCodigoReserva(): string {
  return 'BOL-' + nanoid().replace(/_/g, 'X').toUpperCase();
}

export default function MapaAsientosScreen() {
  const { colors } = useTheme();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);

  const Alert = useDialog();
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
  const [guardando, setGuardando] = useState(false);
  const bloqueo = useRef(false);
  const registrada = useRef(false);
  const codigoReserva = useRef(generarCodigoReserva());

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
    if (registrada.current || asientosOcupadosIds.has(id)) return;
    if (seleccionados.includes(id)) { setSeleccionados(prev => prev.filter(x => x !== id)); return; }
    if (seleccionados.length >= cantidad) { Alert.alert('Límite alcanzado', `Solo puedes seleccionar ${cantidad} asiento(s).`); return; }
    setSeleccionados(prev => [...prev, id]);
  };

  const total = pelicula.precio * cantidad;

  const confirmarCompra = async () => {
    if (bloqueo.current) return;
    bloqueo.current = true;
    setGuardando(true);
    setError('');
    try {
      if (!registrada.current) {
        const resultado = dispatch(comprar({
          id: codigoReserva.current,
          funcionId: funcion.id, peliculaCodigo: pelicula.codigo,
          peliculaNombre: pelicula.nombre, salaId: sala.id, salaNombre: sala.nombre,
          fecha: funcion.fecha, hora: funcion.hora, asientos: seleccionados,
          cantidadBoletos: cantidad, total: Math.round(total * 100) / 100,
          cliente: { nombre: nombreCliente.trim(), email: emailCliente.trim() || undefined },
          fechaCompra: new Date().toISOString(), usado: false,
        }));
        if (!resultado.ok) { setError(resultado.mensaje); return; }
        registrada.current = true;
      }
      // Si falla el disco se reintenta guardar, nunca se crea una segunda compra.
      await guardarEstado();
      Alert.alert('Compra confirmada', 'Tu boleto y su QR se guardaron en Mis Boletos.', [
        { text: 'OK', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'ClienteTabs' }] }) },
      ]);
    } catch {
      setError('No se pudo guardar en el dispositivo. Pulsa de nuevo para reintentar el guardado antes de cerrar la app.');
    } finally {
      bloqueo.current = false;
      setGuardando(false);
    }
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

      <Text style={{ color: colors.muted, fontSize: 12, textAlign: 'center', marginBottom: 8 }}>Desliza hacia los lados para ver toda la sala.</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={styles.mapa}>
        <View style={{ flexDirection: 'column', gap: 6 }}>
        {sala.filas.map((fila) => (
          <View key={fila} style={styles.filaAsientos}>
            <Text style={{ color: colors.muted, width: 22, textAlign: 'center' }}>{fila}</Text>
            {Array.from({ length: sala.columnas }, (_, i) => {
              const id = `${fila}${i + 1}`;
              return <View key={id} style={{ marginLeft: i === Math.ceil(sala.columnas / 2) ? 18 : 0 }}><Asiento id={id} estado={estadoDe(id)} onPress={() => toggleAsiento(id)} /></View>;
            })}
          </View>
        ))}
        </View>
      </ScrollView>

      <View style={styles.leyenda}>
        <Leyenda color={colors.muted} texto="Disponible" />
        <Leyenda color={colors.primary} texto="Seleccionado" />
        <Leyenda color={colors.danger} texto="Ocupado" />
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

      <TouchableOpacity style={styles.botonConfirmar} disabled={guardando} onPress={confirmarCompra}>
        <Text style={styles.botonConfirmarTexto}>{guardando ? 'Guardando...' : registrada.current ? 'Guardar compra registrada' : 'Confirmar compra'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Leyenda({ color, texto }: { color: string; texto: string }) {
  const { colors } = useTheme();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.leyendaItem}>
      <Icon name={texto === 'Ocupado' ? 'close' : 'seat-outline'} color={color} size={17} />
      <Text style={styles.leyendaTexto}>{texto}</Text>
    </View>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colors.surface },
  vacio: { color: colors.muted, textAlign: 'center', marginTop: 40 },
  titulo: { fontSize: 18, fontWeight: '700' },
  subtitulo: { fontSize: 13, color: colors.muted, marginBottom: 12 },
  pantalla: {
    backgroundColor: colors.raised,
    borderBottomWidth: 3,
    borderBottomColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 16,
  },
  pantallaTexto: { color: colors.text, fontSize: 11, letterSpacing: 2 },
  mapa: { flexGrow: 1, justifyContent: 'center', paddingVertical: 12, paddingRight: 8, marginBottom: 12 },
  filaAsientos: { flexDirection: 'row', alignItems: 'center' },
  leyenda: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 16 },
  leyendaItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 8 },
  leyendaColor: { width: 12, height: 12, borderRadius: 3, marginRight: 4 },
  leyendaTexto: { fontSize: 12, color: colors.muted },
  seccion: { fontSize: 14, fontWeight: '700', marginTop: 8, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 10,
  },
  error: { color: colors.danger, marginBottom: 8, fontSize: 13 },
  total: { fontSize: 17, fontWeight: '700', marginTop: 8 },
  botonConfirmar: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  botonConfirmarTexto: { color: colors.primaryText, fontWeight: '700', fontSize: 15 },
});
