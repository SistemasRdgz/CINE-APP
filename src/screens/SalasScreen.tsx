import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { guardarSala, borrarSala } from '../redux/operaciones';
import { guardarEstado } from '../redux/store';
import { siguienteCodigoSala } from '../domain/salas';
import { Sala } from '../types/sala';
import { useTheme, Palette } from '../ui/theme';
import { useDialog } from '../ui/Dialog';
import Icon from '../ui/Icon';
export default function SalasScreen() {
  const { colors: c } = useTheme();
  const s = React.useMemo(() => makeStyles(c), [c]);
  const salas = useAppSelector(state => state.salas.lista);
  const dispatch = useAppDispatch(), dialog = useDialog();
  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [filas, setFilas] = useState('8');
  const [columnas, setColumnas] = useState('10');
  const [guardando, setGuardando] = useState(false);
  const scroll = React.useRef<ScrollView>(null);
  const existente = salas.find(x => x.id === codigo);
  const bloqueada = editando && !!existente?.funciones.length;
  function abrir(sala?: Sala) {
    setCodigo(sala?.id ?? siguienteCodigoSala(salas)); setNombre(sala?.nombre ?? '');
    setFilas(String(sala?.filas.length ?? 8)); setColumnas(String(sala?.columnas ?? 10));
    setEditando(!!sala); setAbierto(true); scroll.current?.scrollTo({ y: 0, animated: true });
  }
  async function guardar() {
    if (guardando) return;
    const f = Number(filas), col = Number(columnas);
    if (!Number.isInteger(f) || f < 1 || f > 26 || !Number.isInteger(col) || col < 1 || col > 20) {
      dialog.alert('Revisa la distribución', 'Indica de 1 a 26 filas y de 1 a 20 asientos por fila. Usa números enteros.'); return;
    }
    const datos = { id: codigo.trim().toUpperCase(), nombre: nombre.trim(), filas: bloqueada ? existente!.filas : Array.from({ length: f }, (_, i) => String.fromCharCode(65 + i)), columnas: col };
    const result = dispatch(guardarSala(datos, editando));
    if (!result.ok) { dialog.alert('No se pudo guardar', result.mensaje); return; }
    setCodigo(datos.id); setEditando(true); setGuardando(true);
    try { await guardarEstado(); setAbierto(false); dialog.alert('Sala guardada', result.mensaje); }
    catch { dialog.alert('Guardado pendiente', 'La sala está registrada en la app, pero falló el almacenamiento. Pulsa Guardar de nuevo antes de cerrar.'); }
    finally { setGuardando(false); }
  }
  function eliminar(sala: Sala) {
    dialog.alert('Eliminar sala', `¿Quieres eliminar ${sala.nombre}? Solo es posible si no tiene películas, funciones ni reservas asociadas.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        const result = dispatch(borrarSala(sala.id));
        if (!result.ok) { dialog.alert('Sala protegida', result.mensaje); return; }
        setAbierto(false);
        try { await guardarEstado(); dialog.alert('Sala eliminada', result.mensaje); }
        catch { dialog.alert('Guardado pendiente', 'No se pudo guardar la eliminación. Mantén la app abierta y reintenta.', [{ text: 'Reintentar', onPress: async () => { try { await guardarEstado(); } catch { dialog.alert('Sin guardar', 'Revisa el espacio de almacenamiento del dispositivo.'); } } }]); }
      } },
    ]);
  }
  const total = Number(filas) * Number(columnas);
  return <ScrollView ref={scroll} style={s.root} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
    <Text style={s.eyebrow}>ZONA DE PERSONAL</Text><Text style={s.title}>Gestión de salas</Text>
    <Text style={s.subtitle}>Define los espacios donde comienzan las historias.</Text>
    {!abierto ? <TouchableOpacity style={s.primary} onPress={() => abrir()}><Icon name="plus" color={c.primaryText} /><Text style={s.primaryText}>Agregar sala</Text></TouchableOpacity> : <View style={s.form}>
      <Text style={s.section}>{editando ? 'Editar sala' : 'Nueva sala'}</Text>
      <Text style={s.label}>Código</Text><TextInput accessibilityLabel="Código de sala" style={s.input} value={codigo} onChangeText={setCodigo} editable={!editando && !guardando} autoCapitalize="characters" maxLength={16} placeholder="Ej. S3" placeholderTextColor={c.muted} />
      <Text style={s.label}>Nombre</Text><TextInput accessibilityLabel="Nombre de sala" style={s.input} value={nombre} onChangeText={setNombre} editable={!guardando} placeholder="Ej. Sala 3" placeholderTextColor={c.muted} />
      <View style={s.row}><View style={s.grow}><Text style={s.label}>Filas (1–26)</Text><TextInput accessibilityLabel="Cantidad de filas" style={s.input} value={filas} onChangeText={setFilas} editable={!bloqueada && !guardando} keyboardType="number-pad" /></View><View style={s.grow}><Text style={s.label}>Asientos por fila</Text><TextInput accessibilityLabel="Asientos por fila" style={s.input} value={columnas} onChangeText={setColumnas} editable={!bloqueada && !guardando} keyboardType="number-pad" /></View></View>
      <Text style={s.note}>{bloqueada ? 'Esta sala ya tiene funciones. Su distribución está protegida; puedes renombrarla.' : 'Las filas se identifican con letras (A, B, C…). Cada fila admite hasta 20 asientos.'}</Text>
      <View style={s.capacity}><Icon name="seat-outline" /><Text style={s.section}>{Number.isFinite(total) && total > 0 ? total : 0} asientos por función</Text></View>
      <TouchableOpacity disabled={guardando} style={s.primary} onPress={guardar}>{guardando ? <ActivityIndicator color={c.primaryText} /> : <Icon name="content-save-outline" color={c.primaryText} size={20} />}<Text style={s.primaryText}>Guardar sala</Text></TouchableOpacity>
      <TouchableOpacity disabled={guardando} style={s.cancel} onPress={() => setAbierto(false)}><Text style={s.note}>Cancelar</Text></TouchableOpacity>
    </View>}
    <Text style={[s.section, { marginVertical: 20 }]}>Salas registradas · {salas.length}</Text>
    {!salas.length && <Text style={s.note}>Todavía no hay salas. Agrega una para asignar películas y programar funciones.</Text>}
    {salas.map(sala => <View key={sala.id} style={s.card}><View style={s.row}><Icon name="theater" size={32} /><View style={s.grow}><Text style={s.section}>{sala.nombre}</Text><Text style={s.note}>{sala.id} · {sala.filas.length} filas × {sala.columnas} asientos</Text></View></View>
      <Text style={s.note}>{sala.filas.length * sala.columnas} lugares por función · {sala.funciones.length} funciones</Text>
      <View style={s.row}><TouchableOpacity disabled={guardando} style={s.secondary} onPress={() => abrir(sala)}><Icon name="pencil-outline" size={19} /><Text style={s.secondaryText}>Editar</Text></TouchableOpacity><TouchableOpacity disabled={guardando} style={s.secondary} onPress={() => eliminar(sala)}><Icon name="trash-can-outline" size={19} color={c.danger} /><Text style={[s.secondaryText, { color: c.danger }]}>Eliminar</Text></TouchableOpacity></View>
    </View>)}
  </ScrollView>;
}
const makeStyles = (c: Palette) => StyleSheet.create({
  root: { flex: 1, backgroundColor: c.background }, content: { padding: 20, paddingBottom: 40 }, eyebrow: { color: c.primary, fontSize: 10, letterSpacing: 2 }, title: { color: c.text, fontSize: 28, fontWeight: '800', marginTop: 10 }, subtitle: { color: c.muted, lineHeight: 21, marginVertical: 14 },
  form: { backgroundColor: c.surface, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: c.border }, section: { color: c.text, fontSize: 17, fontWeight: '700', flexShrink: 1 }, label: { color: c.text, fontSize: 13, marginTop: 16, marginBottom: 8 }, input: { color: c.text, backgroundColor: c.background, borderWidth: 1, borderColor: c.border, borderRadius: 10, padding: 12, minHeight: 48, fontSize: 16 },
  note: { color: c.muted, fontSize: 12, lineHeight: 19, marginTop: 6 }, row: { flexDirection: 'row', alignItems: 'center', gap: 12 }, grow: { flex: 1 }, capacity: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 18 },
  primary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, backgroundColor: c.primary, borderRadius: 12 }, primaryText: { color: c.primaryText, fontWeight: '700', fontSize: 15 }, cancel: { padding: 12, alignItems: 'center' },
  card: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 16, padding: 18, marginBottom: 12 }, secondary: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingVertical: 12, borderRadius: 10, backgroundColor: c.raised, marginTop: 14 }, secondaryText: { color: c.text, fontWeight: '600', fontSize: 12 },
});
