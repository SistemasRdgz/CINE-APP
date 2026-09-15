import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import Icon from './Icon';
import { colors as c } from './theme';
export interface Option { label: string; value: string }
export default function Select({ label, value, options, onChange, hint }: { label: string; value: string; options: Option[]; onChange: (value: string) => void; hint?: string }) {
  const [open, setOpen] = useState(false);
  return <View style={s.field}>
    <Text style={s.label}>{label}</Text>
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={`${label}: ${options.find(o => o.value === value)?.label ?? 'Sin seleccionar'}`} style={s.input} onPress={() => setOpen(true)}>
      <Text style={[s.value, !value && { color: c.muted }]}>{options.find(o => o.value === value)?.label ?? (value || 'Seleccionar')}</Text><Icon name="chevron-down" size={22} />
    </TouchableOpacity>
    {!!hint && <Text style={s.hint}>{hint}</Text>}
    <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
      <View style={s.backdrop}><View style={s.sheet}>
        <View style={s.header}><Text style={s.title}>{label}</Text><TouchableOpacity accessibilityRole="button" accessibilityLabel="Cerrar selector" onPress={() => setOpen(false)} style={s.close}><Icon name="close" /></TouchableOpacity></View>
        <FlatList data={options} keyExtractor={o => o.value} renderItem={({ item }) => <TouchableOpacity accessibilityRole="radio" accessibilityState={{ selected: value === item.value }} style={[s.option, value === item.value && s.selected]} onPress={() => { onChange(item.value); setOpen(false); }}>
          <Text style={s.value}>{item.label}</Text>{value === item.value && <Icon name="check" size={22} />}
        </TouchableOpacity>} />
      </View></View>
    </Modal>
  </View>;
}
const s = StyleSheet.create({
  field: { marginBottom: 18 }, label: { color: c.text, fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { padding: 14, minHeight: 52, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  value: { color: c.text, fontSize: 16, flex: 1 }, hint: { color: c.muted, fontSize: 12, lineHeight: 18, marginTop: 6 },
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#000000BB' }, sheet: { backgroundColor: c.surface, maxHeight: '75%', padding: 20, paddingBottom: 32, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 }, title: { color: c.text, fontSize: 22, fontWeight: '700', flex: 1 }, close: { padding: 10 },
  option: { padding: 16, flexDirection: 'row', alignItems: 'center', borderRadius: 12, marginBottom: 6 }, selected: { backgroundColor: c.raised },
});
