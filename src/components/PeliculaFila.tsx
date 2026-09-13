import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Pelicula } from '../types/pelicula';

interface Props {
  pelicula: Pelicula;
  modo: 'cliente' | 'personal';
  onReservar?: () => void;
  onEditar?: () => void;
  onEliminar?: () => void;
  onToggleEstado?: () => void;
}

export default function PeliculaFila({
  pelicula,
  modo,
  onReservar,
  onEditar,
  onEliminar,
  onToggleEstado,
}: Props) {
  const disponible = pelicula.estado === 'Disponible';

  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <View style={styles.filaTitulo}>
          <Text style={styles.nombre}>{pelicula.nombre}</Text>
          <View style={[styles.badge, disponible ? styles.badgeOk : styles.badgeNo]}>
            <Text style={styles.badgeTexto}>{pelicula.estado}</Text>
          </View>
        </View>
        <Text style={styles.detalle}>
          {pelicula.genero} · {pelicula.duracion} min · {pelicula.clasificacion}
        </Text>
        <Text style={styles.detalle}>
          Sala: {pelicula.salaAsignada} · ${pelicula.precio.toFixed(2)}
        </Text>
        {modo === 'personal' && <Text style={styles.codigo}>Código: {pelicula.codigo}</Text>}
      </View>

      {modo === 'cliente' && (
        <TouchableOpacity
          style={[styles.boton, !disponible && styles.botonDeshabilitado]}
          disabled={!disponible}
          onPress={onReservar}
        >
          <Text style={styles.botonTexto}>Reservar</Text>
        </TouchableOpacity>
      )}

      {modo === 'personal' && (
        <View style={styles.accionesPersonal}>
          <TouchableOpacity style={styles.botonSecundario} onPress={onEditar}>
            <Text style={styles.botonSecundarioTexto}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.botonSecundario} onPress={onToggleEstado}>
            <Text style={styles.botonSecundarioTexto}>
              {disponible ? 'Deshabilitar' : 'Habilitar'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.botonEliminar} onPress={onEliminar}>
            <Text style={styles.botonEliminarTexto}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  info: { flexDirection: 'column' },
  filaTitulo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nombre: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', flexShrink: 1 },
  detalle: { fontSize: 13, color: '#555', marginTop: 2 },
  codigo: { fontSize: 12, color: '#999', marginTop: 2 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 8,
  },
  badgeOk: { backgroundColor: '#DCFCE7' },
  badgeNo: { backgroundColor: '#FEE2E2' },
  badgeTexto: { fontSize: 11, fontWeight: '600', color: '#333' },
  boton: {
    marginTop: 10,
    backgroundColor: '#1E3A8A',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  botonDeshabilitado: { backgroundColor: '#B0B7C3' },
  botonTexto: { color: '#fff', fontWeight: '600' },
  accionesPersonal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  botonSecundario: {
    flex: 1,
    marginRight: 6,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
  },
  botonSecundarioTexto: { color: '#1E3A8A', fontWeight: '600', fontSize: 13 },
  botonEliminar: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
  },
  botonEliminarTexto: { color: '#B91C1C', fontWeight: '600', fontSize: 13 },
});
