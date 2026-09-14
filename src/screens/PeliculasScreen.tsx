import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
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
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<Record<string, { modo?: Modo }>, string>>();
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

  return (
    <View style={styles.contenedor}>
      <Buscador valor={texto} onCambiar={setTexto} />
      <Filtros grupos={gruposFiltro} />

      {modo === 'personal' && (
        <TouchableOpacity
          style={styles.botonAgregar}
          onPress={() => navigation.navigate('FormularioPelicula', undefined)}
        >
          <Text style={styles.botonAgregarTexto}>+ Agregar película</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={peliculasFiltradas}
        keyExtractor={(item) => item.codigo}
        contentContainerStyle={{ paddingBottom: 24, paddingTop: 8 }}
        ListEmptyComponent={
          <Text style={styles.vacio}>No se encontraron películas con esos criterios.</Text>
        }
        renderItem={({ item }) => (
          <PeliculaFila
            pelicula={item}
            modo={modo}
            onReservar={() => navigation.navigate('Reserva', { peliculaCodigo: item.codigo })}
            onEditar={() => navigation.navigate('FormularioPelicula', { codigo: item.codigo })}
            onEliminar={() => confirmarEliminar(item.codigo, item.nombre)}
            onToggleEstado={() => dispatch(toggleEstadoPelicula(item.codigo))}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F3F4F6' },
  vacio: { textAlign: 'center', color: '#888', marginTop: 40 },
  botonAgregar: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#1E3A8A',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  botonAgregarTexto: { color: '#fff', fontWeight: '700' },
});
