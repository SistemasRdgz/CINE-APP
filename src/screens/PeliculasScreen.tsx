import Icon from '../ui/Icon';
import { colors } from '../ui/theme';
import React, { useMemo, useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Text } from '../ui/Typography';
import { useDialog } from '../ui/Dialog';

import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { normalizar } from '../domain/cine';
import Buscador from '../components/Buscador';
import Filtros from '../components/Filtros';
import PeliculaFila from '../components/PeliculaFila';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { eliminarPelicula, toggleEstadoPelicula } from '../redux/slices/peliculasSlice';
import { RootStackParamList } from '../navigation/types';

type Modo = 'cliente' | 'personal';

interface Props {
  modo?: Modo;
}

export default function PeliculasScreen({ modo: modoProp }: Props) {
  const Alert = useDialog();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<Record<string, { modo?: Modo }>, string>>();
  const { width } = useWindowDimensions();
  const modo: Modo = modoProp ?? route.params?.modo ?? 'cliente';

  const dispatch = useAppDispatch();
  const peliculas = useAppSelector((state) => state.peliculas.lista);
  const salasDisponibles = useAppSelector(state => state.salas.lista);

  const [texto, setTexto] = useState('');
  const [genero, setGenero] = useState<string | null>(null);
  const [clasificacion, setClasificacion] = useState<string | null>(null);
  const [sala, setSala] = useState<string | null>(null);
  const [estadoFiltro, setEstadoFiltro] = useState<string | null>(null);

  const generos = useMemo(
    () => Array.from(new Set(peliculas.map((p) => p.genero))),
    [peliculas]
  );
  const clasificaciones = useMemo(
    () => Array.from(new Set(peliculas.map((p) => p.clasificacion))),
    [peliculas]
  );
  const salas = useMemo(
    () => Array.from(new Set(peliculas.map((p) => p.salaAsignada))),
    [peliculas]
  );

  const peliculasFiltradas = useMemo(() => {
    const t = normalizar(texto);
    return peliculas.filter((p) => {
      if (modo === 'cliente' && p.estado !== 'Disponible') return false;
      if (estadoFiltro && p.estado !== estadoFiltro) return false;
      if (genero && p.genero !== genero) return false;
      if (clasificacion && p.clasificacion !== clasificacion) return false;
      if (sala && p.salaAsignada !== sala) return false;
      if (
        t.length > 0 &&
        !normalizar(`${p.nombre} ${p.genero} ${p.clasificacion} ${p.salaAsignada} ${salasDisponibles.find(s => s.id === p.salaAsignada)?.nombre ?? ''}`).includes(t)
      ) {
        return false;
      }
      return true;
    });
  }, [peliculas, texto, genero, clasificacion, sala, estadoFiltro, modo, salasDisponibles]);

  const confirmarEliminar = (codigo: string, nombre: string) => {
    Alert.alert('Eliminar película', `¿Seguro que deseas eliminar "${nombre}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => dispatch(eliminarPelicula(codigo)) },
    ]);
  };

  const gruposFiltro = [
    { etiqueta: 'Género', opciones: generos, valorSeleccionado: genero, onSeleccionar: setGenero },
    {
      etiqueta: 'Clasificación',
      opciones: clasificaciones,
      valorSeleccionado: clasificacion,
      onSeleccionar: setClasificacion,
    },
    { etiqueta: 'Sala', opciones: salas, valorSeleccionado: sala, onSeleccionar: setSala },
  ];
  {
    gruposFiltro.push({
      etiqueta: 'Estado',
      opciones: modo === 'personal' ? ['Disponible', 'No disponible'] : ['Disponible'],
      valorSeleccionado: estadoFiltro,
      onSeleccionar: setEstadoFiltro,
    });
  }

  const columnas = modo === 'cliente' && width >= 350 ? 2 : 1;
  return <View style={styles.contenedor}>
    <FlatList key={columnas} numColumns={columnas} data={peliculasFiltradas}
      keyExtractor={item => item.codigo} contentContainerStyle={styles.lista}
      columnWrapperStyle={columnas > 1 ? { gap: 12 } : undefined}
      ListHeaderComponent={<>
        {modo === 'cliente' && <View style={styles.hero}>
          <View style={styles.brandRow}><Text style={styles.brand}>CineApp</Text><Text style={styles.eyebrow}>EN CARTELERA</Text></View>
          <Text style={styles.slogan}>Tu próxima gran historia</Text>
          <Text style={styles.subtitle}>Elige una película. Vive el cine.</Text>
        </View>}
        <Buscador valor={texto} onCambiar={setTexto} />
        <Filtros grupos={gruposFiltro} />
        {modo === 'personal' && <TouchableOpacity style={styles.botonAgregar} onPress={() => navigation.navigate('FormularioPelicula', undefined)}><Icon name="plus" color={colors.primaryText} size={20} /><Text style={styles.botonAgregarTexto}>Agregar película</Text></TouchableOpacity>}
        <Text style={styles.resultados}>{peliculasFiltradas.length} película{peliculasFiltradas.length === 1 ? '' : 's'}</Text>
      </>}
      ListEmptyComponent={<Text style={styles.vacio}>No se encontraron películas con esos criterios.</Text>}
      renderItem={({ item, index }) => <View style={{ flex: 1, maxWidth: columnas === 2 ? '48.5%' : '100%', marginBottom: 16 }}>
        <PeliculaFila pelicula={item} modo={modo}
          onReservar={() => navigation.navigate('Reserva', { peliculaCodigo: item.codigo })}
          onEditar={() => navigation.navigate('FormularioPelicula', { codigo: item.codigo })}
          onEliminar={() => confirmarEliminar(item.codigo, item.nombre)}
          onToggleEstado={() => dispatch(toggleEstadoPelicula(item.codigo))} />
      </View>} />
  </View>;
}
const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colors.background }, lista: { paddingHorizontal: 16, paddingBottom: 24 },
  hero: { paddingTop: 10, paddingBottom: 12 }, brandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, brand: { color: colors.primary, fontSize: 22, fontWeight: '800' },
  eyebrow: { color: colors.muted, fontSize: 10, letterSpacing: 2 }, slogan: { color: colors.text, fontSize: 24, lineHeight: 29, fontWeight: '800', marginTop: 10 }, subtitle: { color: colors.muted, marginTop: 5, fontSize: 12 },
  resultados: { color: colors.muted, marginVertical: 10, fontSize: 12 }, vacio: { color: colors.muted, textAlign: 'center', paddingVertical: 24 },
  botonAgregar: { backgroundColor: colors.primary, borderRadius: 12, padding: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 16 }, botonAgregarTexto: { color: colors.primaryText, fontWeight: '700' },
});
