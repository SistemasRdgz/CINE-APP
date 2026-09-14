import React from 'react';
import BoletoQR from '../components/BoletoQR';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useAppSelector } from '../redux/hooks';

export default function HistorialScreen() {
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

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F3F4F6' },
  vacio: { textAlign: 'center', color: '#888', marginTop: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  filaTitulo: { flexDirection: 'row', justifyContent: 'space-between' },
  pelicula: { fontSize: 16, fontWeight: '700', flexShrink: 1 },
  codigo: { fontSize: 12, color: '#999' },
  detalle: { fontSize: 13, color: '#555', marginTop: 2 },
  filaTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    alignItems: 'center',
  },
  total: { fontSize: 15, fontWeight: '700' },
  pendiente: { color: '#16A34A', fontWeight: '600', fontSize: 12 },
  usado: { color: '#B91C1C', fontWeight: '600', fontSize: 12 },
});
