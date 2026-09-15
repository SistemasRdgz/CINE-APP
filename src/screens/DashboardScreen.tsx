import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createSelector } from '@reduxjs/toolkit';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppSelector } from '../redux/hooks';
import { estadisticas } from '../domain/cine';
import type { RootState } from '../redux/store';
import type { RootStackParamList } from '../navigation/types';
import Icon, { IconName } from '../ui/Icon';
import { colors as c } from '../ui/theme';
const seleccionar = createSelector([(s: RootState) => s], estadisticas);
export default function DashboardScreen() {
  const stats = useAppSelector(seleccionar);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const items: { label: string; value: number; icon: IconName }[] = [
    { label: 'Películas', value: stats.peliculas, icon: 'movie-open-outline' },
    { label: 'Funciones', value: stats.funciones, icon: 'calendar-outline' },
    { label: 'Boletos vendidos', value: stats.boletos, icon: 'ticket-outline' },
    { label: 'Asientos ocupados', value: stats.ocupados, icon: 'seat-outline' },
  ];
  return <ScrollView style={s.root} contentContainerStyle={s.content}>
    <Text style={s.eyebrow}>ZONA DE PERSONAL</Text><Text style={s.title}>Panel del cine</Text><Text style={s.subtitle}>Una mirada a todas tus funciones.</Text>
    <View style={s.revenue}><Icon name="wallet-outline" size={42} /><View style={{ flex: 1 }}><Text style={s.label}>Ingresos generados</Text><Text style={s.amount}>${stats.ingresos.toFixed(2)}</Text></View></View>
    <View style={s.grid}>{items.map(x => <View key={x.label} style={s.card}><Icon name={x.icon} color={c.muted} size={28} /><Text style={s.value}>{x.value}</Text><Text style={s.label}>{x.label}</Text></View>)}</View>
    <View style={s.available}><Icon name="seat-outline" color={c.muted} size={32} /><View style={{ flex: 1 }}><Text style={s.label}>Asientos disponibles</Text><Text style={s.value}>{stats.disponibles}</Text></View></View>
    <View style={s.feature}><Icon name="trophy-outline" size={24} /><View style={{ flex: 1 }}><Text style={s.label}>Película más reservada{stats.masReservadas.length > 1 ? ' · Empate' : ''}</Text>
      {stats.masReservadas.length ? stats.masReservadas.map((x, i) => <View key={`${x.nombre}-${i}`}><Text style={s.best}>{x.nombre}</Text><Text style={s.gold}>{x.boletos} boletos</Text></View>) : <Text style={s.best}>Todavía no hay ventas</Text>}
    </View></View>
    <View style={s.actions}><TouchableOpacity style={s.action} onPress={() => navigation.navigate('Escaner')}><Icon name="qrcode-scan" /><Text style={s.actionText}>Validar boleto</Text></TouchableOpacity><TouchableOpacity style={s.action} onPress={() => navigation.navigate('Funciones')}><Icon name="calendar-clock-outline" /><Text style={s.actionText}>Programar función</Text></TouchableOpacity></View>
    <Text style={s.note}>Acumulado local. La capacidad se suma por función. Los boletos utilizados siguen contando como ventas y asientos ocupados.</Text>
  </ScrollView>;
}
const s = StyleSheet.create({ root: { flex: 1, backgroundColor: c.background }, content: { padding: 20, paddingBottom: 36 }, eyebrow: { color: c.primary, letterSpacing: 2, fontSize: 10 }, title: { color: c.text, fontSize: 30, fontWeight: '800', marginTop: 10 }, subtitle: { color: c.muted, marginTop: 8, marginBottom: 24 },
  revenue: { backgroundColor: c.wineSoft, borderWidth: 1, borderColor: c.wine, borderRadius: 18, padding: 22, flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 16 }, amount: { color: c.text, fontSize: 36, fontWeight: '800', marginTop: 6 }, label: { color: c.muted, fontSize: 13, lineHeight: 19 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 }, card: { flexBasis: '44%', flexGrow: 1, padding: 18, borderWidth: 1, borderColor: c.border, borderRadius: 16, backgroundColor: c.surface }, value: { color: c.text, fontSize: 28, fontWeight: '700', marginVertical: 6 },
  available: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, padding: 18, borderRadius: 16, flexDirection: 'row', gap: 18, alignItems: 'center', marginTop: 12 }, feature: { flexDirection: 'row', gap: 14, padding: 20, borderRadius: 16, backgroundColor: c.raised, marginTop: 16 }, best: { color: c.text, fontSize: 19, fontWeight: '700', lineHeight: 25, marginVertical: 8 }, gold: { color: c.primary, fontSize: 13 },
  actions: { flexDirection: 'row', gap: 12, marginVertical: 20 }, action: { flex: 1, padding: 16, borderRadius: 14, backgroundColor: c.surface, alignItems: 'center', gap: 10, borderWidth: 1, borderColor: c.border }, actionText: { color: c.text, fontSize: 12, textAlign: 'center' }, note: { color: c.muted, fontSize: 12, lineHeight: 20 },
});
