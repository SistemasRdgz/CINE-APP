import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Pelicula } from '../types/pelicula';
import Poster from './Poster';
import Icon from '../ui/Icon';
import { useTheme, Palette } from '../ui/theme';
interface Props { pelicula: Pelicula; modo: 'cliente' | 'personal'; onReservar?: () => void; onEditar?: () => void; onEliminar?: () => void; onToggleEstado?: () => void }
export default function PeliculaFila({ pelicula: p, modo, onReservar, onEditar, onEliminar, onToggleEstado }: Props) {
  const { colors: c } = useTheme();
  const s = React.useMemo(() => makeStyles(c), [c]);

  const disponible = p.estado === 'Disponible';
  return <View style={s.card}>
    <Poster nombre={p.nombre} genero={p.genero} imagen={p.imagen} />
    <View style={s.body}>
      <Text style={s.name}>{p.nombre}</Text>
      <Text style={s.detail}>{p.genero} · {p.duracion} min</Text>
      <Text style={s.detail}>{p.clasificacion} · Sala {p.salaAsignada.replace(/^S/, '')}</Text>
      <View style={s.priceRow}><Text style={s.price}>${p.precio.toFixed(2)}</Text><Text style={[s.status, !disponible && { color: c.danger }]}>{p.estado}</Text></View>
      {modo === 'cliente' ? <TouchableOpacity accessibilityRole="button" style={s.book} disabled={!disponible} onPress={onReservar}><Icon name="ticket-outline" size={18} color={c.primaryText} /><Text style={s.bookText}>Reservar</Text></TouchableOpacity> : <>
        <Text style={s.detail}>{p.codigo}</Text>
        <View style={s.actions}>
          <TouchableOpacity accessibilityLabel={`Editar ${p.nombre}`} style={s.action} onPress={onEditar}><Icon name="pencil-outline" size={20} /><Text style={s.actionText}>Editar</Text></TouchableOpacity>
          <TouchableOpacity accessibilityLabel={disponible ? 'Deshabilitar película' : 'Habilitar película'} style={s.action} onPress={onToggleEstado}><Icon name={disponible ? 'eye-off-outline' : 'eye-outline'} size={20} /><Text style={s.actionText}>{disponible ? 'Ocultar' : 'Mostrar'}</Text></TouchableOpacity>
          <TouchableOpacity accessibilityLabel={`Eliminar ${p.nombre}`} style={s.action} onPress={onEliminar}><Icon name="trash-can-outline" size={20} color={c.danger} /><Text style={[s.actionText, { color: c.danger }]}>Eliminar</Text></TouchableOpacity>
        </View>
      </>}
    </View>
  </View>;
}
const makeStyles = (c: Palette) => StyleSheet.create({ card: { flex: 1, backgroundColor: c.surface, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: c.border }, body: { padding: 12 },
  name: { color: c.text, fontSize: 16, lineHeight: 21, fontWeight: '700', marginBottom: 6 }, detail: { color: c.muted, fontSize: 12, lineHeight: 19 },
  priceRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginVertical: 10 }, price: { color: c.primary, fontSize: 19, fontWeight: '700' }, status: { color: c.success, fontSize: 10 },
  book: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: c.primary, borderRadius: 10, paddingVertical: 12 }, bookText: { color: c.primaryText, fontWeight: '700' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }, action: { flex: 1, minWidth: 65, alignItems: 'center', backgroundColor: c.raised, paddingVertical: 10, borderRadius: 9, gap: 4 }, actionText: { color: c.text, fontSize: 11 },
});
