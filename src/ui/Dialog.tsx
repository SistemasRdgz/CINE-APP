import React, { createContext, useContext, useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView, AlertButton, AppState } from 'react-native';
import Icon from './Icon';
import { colors as c } from './theme';
interface Aviso { title: string; message: string; buttons: AlertButton[] }
const Context = createContext<{ alert: (title: string, message?: string, buttons?: AlertButton[]) => void }>({ alert: () => {} });
export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [aviso, setAviso] = useState<Aviso | null>(null);
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => { if (state === 'background') setAviso(null); });
    return () => sub.remove();
  }, []);
  const cerrar = () => { const cancel = aviso?.buttons.find(b => b.style === 'cancel'); setAviso(null); cancel?.onPress?.(); };
  return <Context.Provider value={{ alert: (title, message = '', buttons = [{ text: 'Entendido' }]) => setAviso({ title, message, buttons }) }}>
    {children}
    <Modal visible={!!aviso} transparent animationType="fade" onRequestClose={() => {
      if (aviso?.buttons.length === 1) { const b = aviso.buttons[0]; setAviso(null); b.onPress?.(); } else cerrar();
    }}>
      <View style={s.overlay}><View style={s.card} accessibilityViewIsModal>
        <View style={s.icon}><Icon name={aviso?.buttons.some(b => b.style === 'destructive') ? 'alert-circle-outline' : 'information-outline'} size={32} /></View>
        <Text style={s.title} accessibilityRole="header">{aviso?.title}</Text>
        <ScrollView style={s.scroll}><Text style={s.message}>{aviso?.message}</Text></ScrollView>
        <View style={s.actions}>{aviso?.buttons.map((b, i) => <TouchableOpacity key={i} accessibilityRole="button" style={[s.button, b.style === 'cancel' && s.cancel, b.style === 'destructive' && s.destructive]} onPress={() => { setAviso(null); b.onPress?.(); }}>
          <Text style={[s.buttonText, b.style === 'cancel' && { color: c.text }, b.style === 'destructive' && { color: c.text }]}>{b.text ?? 'Aceptar'}</Text>
        </TouchableOpacity>)}</View>
      </View></View>
    </Modal>
  </Context.Provider>;
}
export const useDialog = () => useContext(Context);
const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#000000BB', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 420, maxHeight: '85%', borderRadius: 24, backgroundColor: c.surface, padding: 24, borderWidth: 1, borderColor: c.border },
  icon: { alignSelf: 'flex-start', backgroundColor: c.raised, padding: 12, borderRadius: 18, marginBottom: 16 },
  title: { color: c.text, fontSize: 23, fontWeight: '700', marginBottom: 12 },
  scroll: { flexGrow: 0 }, message: { color: c.muted, fontSize: 16, lineHeight: 24 },
  actions: { gap: 10, marginTop: 24 }, button: { padding: 15, backgroundColor: c.primary, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: c.primaryText, fontWeight: '700', fontSize: 15 }, cancel: { backgroundColor: c.raised }, destructive: { backgroundColor: c.wine },
});
