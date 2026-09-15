import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSesionPersonal } from '../auth/SesionPersonal';
import { RootStackParamList } from '../navigation/types';
import Icon, { IconName } from '../ui/Icon';
import { useTheme, Palette } from '../ui/theme';
export default function PersonalHomeScreen() {
  const { colors: c } = useTheme();
  const s = React.useMemo(() => makeStyles(c), [c]);

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { salir } = useSesionPersonal();
  const items: { route: 'PersonalPeliculas' | 'Dashboard' | 'Escaner' | 'Funciones' | 'Salas'; name: string; description: string; icon: IconName }[] = [
    { route: 'PersonalPeliculas', name: 'Películas', description: 'Gestiona tu cartelera y sus portadas', icon: 'movie-open-outline' },
    { route: 'Dashboard', name: 'Dashboard', description: 'Ventas, ocupación e ingresos', icon: 'view-dashboard-outline' },
    { route: 'Escaner', name: 'Validar boletos', description: 'Escanea un QR para registrar el ingreso', icon: 'qrcode-scan' },
    { route: 'Salas', name: 'Gestión de salas', description: 'Salas, filas y capacidad del cine', icon: 'theater' },
    { route: 'Funciones', name: 'Funciones y horarios', description: 'Programa la próxima experiencia', icon: 'calendar-clock-outline' },
  ];
  return <ScrollView style={s.root} contentContainerStyle={s.content}>
    <View style={s.verified}><Icon name="shield-check-outline" size={18} /><Text style={s.verifiedText}>ACCESO VERIFICADO</Text></View>
    <Text style={s.title}>Detrás de la pantalla</Text><Text style={s.subtitle}>Todo lo que necesitas para gestionar el cine.</Text>
    {items.map(x => <TouchableOpacity accessibilityRole="button" key={x.route} style={s.card} onPress={() => navigation.navigate(x.route)}><View style={s.icon}><Icon name={x.icon} size={29} /></View><View style={s.copy}><Text style={s.name}>{x.name}</Text><Text style={s.description}>{x.description}</Text></View><Icon name="chevron-right" size={22} color={c.muted} /></TouchableOpacity>)}
    <TouchableOpacity style={s.exit} onPress={salir}><Icon name="logout" size={20} color={c.danger} /><Text style={s.exitText}>Salir de la Zona de Personal</Text></TouchableOpacity>
  </ScrollView>;
}
const makeStyles = (c: Palette) => StyleSheet.create({ root: { flex: 1, backgroundColor: c.background }, content: { padding: 20, paddingBottom: 40 },
  verified: { flexDirection: 'row', gap: 7, alignItems: 'center', marginBottom: 16 }, verifiedText: { color: c.primary, fontSize: 10, letterSpacing: 2 },
  title: { color: c.text, fontSize: 29, lineHeight: 35, fontWeight: '800', marginBottom: 10 }, subtitle: { color: c.muted, lineHeight: 22, marginBottom: 28 },
  card: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, padding: 16, borderRadius: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 14 },
  icon: { padding: 12, borderRadius: 14, backgroundColor: c.raised }, copy: { flex: 1 }, name: { color: c.text, fontSize: 17, fontWeight: '700', marginBottom: 5 }, description: { color: c.muted, fontSize: 12, lineHeight: 18 },
  exit: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 20, marginTop: 12 }, exitText: { color: c.danger, fontWeight: '600' },
});
