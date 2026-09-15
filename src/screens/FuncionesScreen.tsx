import DateTimePicker from '@react-native-community/datetimepicker';
import Select from '../ui/Select';
import Icon from '../ui/Icon';
import { useTheme, Palette } from '../ui/theme';
import React, { useState } from 'react';
import { ScrollView, View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '../ui/Typography';
import { useDialog } from '../ui/Dialog';

import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { programarFuncion } from '../redux/operaciones';
import { fechaLocal } from '../domain/cine';
import { nanoid } from '@reduxjs/toolkit';

export default function FuncionesScreen() {
  const { colors } = useTheme();
  const styles = React.useMemo(() => makeStyles(colors), [colors]);

  const Alert = useDialog();
  const peliculas = useAppSelector(s => s.peliculas.lista);
  const salas = useAppSelector(s => s.salas.lista);
  const dispatch = useAppDispatch();
  const [codigo, setCodigo] = useState(peliculas[0]?.codigo ?? '');
  const [fecha, setFecha] = useState(fechaLocal());
  const [hora, setHora] = useState('19:00');
  const [error, setError] = useState('');
  const [selector, setSelector] = useState<'date' | 'time' | null>(null);
  const pelicula = peliculas.find(p => p.codigo === codigo);
  const sala = salas.find(s => s.id === pelicula?.salaAsignada);
  const funciones = salas.flatMap(s => s.funciones.map(f => ({ ...f, sala: s.nombre }))).sort((a, b) => `${a.fecha} ${a.hora}`.localeCompare(`${b.fecha} ${b.hora}`));
  function guardar() {
    const r = dispatch(programarFuncion({ id: `FUN-${nanoid()}`, peliculaCodigo: codigo, salaId: sala?.id ?? '', fecha: fecha.trim(), hora: hora.trim() }));
    setError(r.ok ? '' : r.mensaje);
    if (r.ok) Alert.alert('Listo', 'Función programada. Ya aparece en el flujo de compra si la película está disponible.');
  }
  return <ScrollView style={styles.root} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <Text style={styles.title}>Programar función</Text>
    <Select label="Película" value={codigo} options={peliculas.map(p => ({ label: p.nombre, value: p.codigo }))} onChange={setCodigo} />
    {!peliculas.length && <Text style={styles.error}>Agrega una película antes de programar funciones.</Text>}
    <Text style={styles.label}>Sala: {sala?.nombre ?? 'Sin asignar'}</Text>
    <Text style={styles.label}>Fecha de la función</Text>
    <TouchableOpacity accessibilityRole="button" accessibilityLabel="Elegir fecha de la función" style={styles.picker} onPress={() => setSelector('date')}><Icon name="calendar-month-outline" /><Text style={styles.pickerText}>{new Date(`${fecha}T12:00:00`).toLocaleDateString('es-SV', { day: 'numeric', month: 'long', year: 'numeric' })}</Text><Icon name="chevron-down" size={20} /></TouchableOpacity>
    <Text style={styles.label}>Hora de inicio</Text>
    <TouchableOpacity accessibilityRole="button" accessibilityLabel="Elegir hora de la función" style={styles.picker} onPress={() => setSelector('time')}><Icon name="clock-outline" /><Text style={styles.pickerText}>{hora}</Text><Icon name="chevron-down" size={20} /></TouchableOpacity>
    {selector && <DateTimePicker value={new Date(`${fecha}T${hora}:00`)} mode={selector} display="default" is24Hour minimumDate={selector === 'date' ? new Date(new Date().setHours(0,0,0,0)) : undefined} onChange={(evento, valor) => {
      const modo = selector; setSelector(null);
      if (evento.type !== 'set' || !valor) return;
      if (modo === 'date') setFecha(fechaLocal(valor));
      else setHora(`${String(valor.getHours()).padStart(2, '0')}:${String(valor.getMinutes()).padStart(2, '0')}`);
    }} />}
    {!!error && <Text style={styles.error}>{error}</Text>}
    <TouchableOpacity style={styles.button} onPress={guardar}><Text style={styles.white}>Guardar función</Text></TouchableOpacity>
    <Text style={styles.title}>Funciones registradas ({funciones.length})</Text>
    {funciones.map(f => <View key={f.id} style={styles.card}>
      <Text style={styles.bold}>{peliculas.find(p => p.codigo === f.peliculaCodigo)?.nombre ?? 'Película eliminada'}</Text>
      <Text style={styles.text}>{f.sala} · {f.fecha} · {f.hora}</Text>
    </View>)}
    <Text style={styles.text}>Las funciones con ventas se conservan para mantener el historial y las estadísticas.</Text>
  </ScrollView>;
}
const makeStyles = (colors: Palette) => StyleSheet.create({
  picker: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 16, marginBottom: 14 },
  pickerText: { flex: 1, color: colors.text, fontSize: 16 },
  root: { flex: 1, backgroundColor: colors.background }, content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 20, fontWeight: '700', color: colors.primary, marginVertical: 16 },
  label: { fontWeight: '600', marginVertical: 8, color: colors.muted }, text: { color: colors.muted, lineHeight: 21 }, bold: { fontWeight: '700', marginBottom: 6 },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, choice: { padding: 12, borderRadius: 8, backgroundColor: colors.raised }, active: { backgroundColor: colors.primary },
  white: { color: colors.primaryText, fontWeight: '600' }, input: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: 12, borderRadius: 8 },
  button: { backgroundColor: colors.primary, padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 16 },
  error: { color: colors.danger, marginVertical: 12 }, card: { backgroundColor: colors.surface, padding: 14, borderRadius: 10, marginBottom: 10 },
});
