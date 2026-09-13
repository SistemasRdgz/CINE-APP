import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

interface GrupoFiltro {
  etiqueta: string;
  opciones: string[];
  valorSeleccionado: string | null;
  onSeleccionar: (valor: string | null) => void;
}

interface Props {
  grupos: GrupoFiltro[];
}

export default function Filtros({ grupos }: Props) {
  return (
    <View style={styles.contenedor}>
      {grupos.map((grupo) => (
        <View key={grupo.etiqueta} style={styles.grupo}>
          <Text style={styles.etiquetaGrupo}>{grupo.etiqueta}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.chip, grupo.valorSeleccionado === null && styles.chipActivo]}
              onPress={() => grupo.onSeleccionar(null)}
            >
              <Text
                style={[
                  styles.chipTexto,
                  grupo.valorSeleccionado === null && styles.chipTextoActivo,
                ]}
              >
                Todos
              </Text>
            </TouchableOpacity>
            {grupo.opciones.map((opcion) => (
              <TouchableOpacity
                key={opcion}
                style={[styles.chip, grupo.valorSeleccionado === opcion && styles.chipActivo]}
                onPress={() =>
                  grupo.onSeleccionar(grupo.valorSeleccionado === opcion ? null : opcion)
                }
              >
                <Text
                  style={[
                    styles.chipTexto,
                    grupo.valorSeleccionado === opcion && styles.chipTextoActivo,
                  ]}
                >
                  {opcion}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  grupo: {
    marginBottom: 8,
  },
  etiquetaGrupo: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#eee',
    marginRight: 8,
  },
  chipActivo: {
    backgroundColor: '#1E3A8A',
  },
  chipTexto: {
    fontSize: 13,
    color: '#333',
  },
  chipTextoActivo: {
    color: '#fff',
    fontWeight: '600',
  },
});
