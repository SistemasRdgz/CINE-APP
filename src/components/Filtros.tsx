import { useTheme, Palette } from '../ui/theme';
import React from 'react';
import { View, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Text } from '../ui/Typography';


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
  const { colors } = useTheme();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.contenedor}>
      {grupos.map((grupo) => (
        <View key={grupo.etiqueta} style={styles.grupo}>
          <Text style={styles.etiquetaGrupo}>{grupo.etiqueta}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.opciones}>
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

const makeStyles = (colors: Palette) => StyleSheet.create({
  contenedor: {
    paddingHorizontal: 0,
    paddingTop: 8,
  },
  grupo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  opciones: { flex: 1, minWidth: 0 },
  etiquetaGrupo: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.muted,
    width: 80,
    flexShrink: 0,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 40,
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: colors.raised,
    marginRight: 8,
  },
  chipActivo: {
    backgroundColor: colors.primary,
  },
  chipTexto: {
    fontSize: 13,
    color: colors.text,
  },
  chipTextoActivo: {
    color: colors.primaryText,
    fontWeight: '600',
  },
});
