import { useTheme, Palette } from '../ui/theme';
import React from 'react';
import BoletoQR from '../components/BoletoQR';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text } from '../ui/Typography';

import { useAppSelector } from '../redux/hooks';

export default function HistorialScreen() {
  const { colors } = useTheme();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);

  const reservas = useAppSelector((state) => state.reservas.lista);
  const ordenadas = [...reservas].sort(
    (a, b) => new Date(b.fechaCompra).getTime() - new Date(a.fechaCompra).getTime()
  );

  return (
    <View style={styles.contenedor}>
      <FlatList
        data={ordenadas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text style={styles.vacio}>Aún no tienes boletos comprados.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.filaTitulo}>
              <Text style={styles.pelicula}>{item.peliculaNombre}</Text>
              <Text style={styles.codigo}>{item.id}</Text>
            </View>
            <Text style={styles.detalle}>
              {item.salaNombre} · {item.fecha} · {item.hora}
            </Text>
            <Text style={styles.detalle}>Asientos: {item.asientos.join(', ')}</Text>
            <BoletoQR id={item.id} />
            <Text style={styles.detalle}>Un QR por reserva: incluye todos los asientos indicados.</Text>
            {!!item.fechaUso && <Text style={styles.detalle}>Utilizado: {new Date(item.fechaUso).toLocaleString()}</Text>}
            <Text style={styles.detalle}>Cliente: {item.cliente.nombre}</Text>
            <View style={styles.filaTotal}>
              <Text style={styles.total}>Total: ${item.total.toFixed(2)}</Text>
              <Text style={item.usado ? styles.usado : styles.pendiente}>
                {item.usado ? 'Usado' : 'Válido'}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colors.background },
  vacio: { textAlign: 'center', color: colors.muted, marginTop: 40 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  filaTitulo: { gap: 8, marginBottom: 12 },
  pelicula: { fontSize: 16, fontWeight: '700', flexShrink: 1 },
  codigo: { fontSize: 12, color: colors.muted },
  detalle: { fontSize: 13, color: colors.muted, marginTop: 2 },
  filaTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    alignItems: 'center',
  },
  total: { fontSize: 15, fontWeight: '700' },
  pendiente: { color: colors.success, fontWeight: '600', fontSize: 12 },
  usado: { color: colors.danger, fontWeight: '600', fontSize: 12 },
});
