import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useAppSelector } from '../redux/hooks';
import { estadisticas } from '../domain/cine';
import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../redux/store';

const seleccionar = createSelector([(s: RootState) => s], estadisticas);
export default function DashboardScreen() {
  const stats = useAppSelector(seleccionar);
  const items = [
    ['Películas', String(stats.peliculas)], ['Funciones', String(stats.funciones)],
    ['Boletos vendidos', String(stats.boletos)], ['Asientos disponibles', String(stats.disponibles)],
    ['Asientos ocupados', String(stats.ocupados)], ['Ingresos generados', `$${stats.ingresos.toFixed(2)}`],
  ];
  return <ScrollView style={styles.root} contentContainerStyle={styles.content}>
    <Text style={styles.title}>Resumen del cine</Text>
    <Text style={styles.subtitle}>Las ventas y la disponibilidad se actualizan automáticamente.</Text>
    <View style={styles.grid}>{items.map(([label, value]) => <View key={label} style={styles.card}>
      <Text style={styles.value}>{value}</Text><Text style={styles.label}>{label}</Text>
    </View>)}</View>
    <View style={styles.feature}>
      <Text style={styles.label}>Película más reservada{stats.masReservadas.length > 1 ? ' (empate)' : ''}</Text>
      {stats.masReservadas.length === 0 ? <Text style={styles.title}>Todavía no hay ventas</Text> : stats.masReservadas.map(x => <Text key={x.nombre} style={styles.title}>{x.nombre} · {x.boletos} boletos</Text>)}
    </View>
    <Text style={styles.subtitle}>Acumulado local. La capacidad se suma por función: un asiento puede venderse en distintos horarios. Los boletos usados siguen contando como ventas y asientos ocupados.</Text>
  </ScrollView>;
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F3F4F6' }, content: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 20, fontWeight: '700', color: '#1E3A8A', marginVertical: 8 },
  subtitle: { fontSize: 13, color: '#555', lineHeight: 20, marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { flexGrow: 1, flexBasis: '44%', backgroundColor: 'white', borderRadius: 12, padding: 18 },
  value: { fontSize: 27, fontWeight: '700', color: '#1E3A8A', marginBottom: 8 },
  label: { fontSize: 14, color: '#444' }, feature: { backgroundColor: '#DBEAFE', padding: 18, borderRadius: 12, marginVertical: 16 },
});
