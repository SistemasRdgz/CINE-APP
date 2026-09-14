import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { programarFuncion } from '../redux/operaciones';
import { fechaLocal } from '../domain/cine';
import { nanoid } from '@reduxjs/toolkit';

export default function FuncionesScreen() {
  const peliculas = useAppSelector(s => s.peliculas.lista);
  const salas = useAppSelector(s => s.salas.lista);
  const dispatch = useAppDispatch();
  const [codigo, setCodigo] = useState(peliculas[0]?.codigo ?? '');
  const [fecha, setFecha] = useState(fechaLocal());
  const [hora, setHora] = useState('19:00');
  const [error, setError] = useState('');
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
    <Text style={styles.label}>Película</Text>
    <View style={styles.choices}>{peliculas.map(p => <TouchableOpacity key={p.codigo} style={[styles.choice, codigo === p.codigo && styles.active]} onPress={() => setCodigo(p.codigo)}>
      <Text style={codigo === p.codigo ? styles.white : styles.text}>{p.nombre}</Text>
    </TouchableOpacity>)}</View>
    {!peliculas.length && <Text style={styles.error}>Agrega una película antes de programar funciones.</Text>}
    <Text style={styles.label}>Sala: {sala?.nombre ?? 'Sin asignar'}</Text>
    <Text style={styles.label}>Fecha (AAAA-MM-DD)</Text>
    <TextInput accessibilityLabel="Fecha de la función" style={styles.input} value={fecha} onChangeText={setFecha} placeholder="2026-09-20" maxLength={10} />
    <Text style={styles.label}>Hora de 24 horas (HH:MM)</Text>
    <TextInput accessibilityLabel="Hora de la función" style={styles.input} value={hora} onChangeText={setHora} placeholder="19:30" maxLength={5} />
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
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F3F4F6' }, content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 20, fontWeight: '700', color: '#1E3A8A', marginVertical: 16 },
  label: { fontWeight: '600', marginVertical: 8, color: '#444' }, text: { color: '#444', lineHeight: 21 }, bold: { fontWeight: '700', marginBottom: 6 },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, choice: { padding: 12, borderRadius: 8, backgroundColor: '#E5E7EB' }, active: { backgroundColor: '#1E3A8A' },
  white: { color: 'white', fontWeight: '600' }, input: { borderWidth: 1, borderColor: '#CCC', backgroundColor: 'white', padding: 12, borderRadius: 8 },
  button: { backgroundColor: '#1E3A8A', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 16 },
  error: { color: '#B91C1C', marginVertical: 12 }, card: { backgroundColor: 'white', padding: 14, borderRadius: 10, marginBottom: 10 },
});
