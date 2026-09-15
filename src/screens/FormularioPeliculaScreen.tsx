import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { agregarPelicula, editarPelicula } from '../redux/slices/peliculasSlice';
import { RootStackParamList } from '../navigation/types';
import { errorPelicula } from '../domain/cine';
import { GENEROS, CLASIFICACIONES, sugerirCodigo } from '../domain/catalogo';
import { Pelicula, EstadoPelicula } from '../types/pelicula';
import Select from '../ui/Select';
import Icon from '../ui/Icon';
import Poster from '../components/Poster';
import { colors as c } from '../ui/theme';
import { useDialog } from '../ui/Dialog';
import { guardarPoster } from '../services/imagenes';
import { guardarEstado } from '../redux/store';
import { useSesionPersonal } from '../auth/SesionPersonal';

export default function FormularioPeliculaScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'FormularioPelicula'>>();
  const peliculas = useAppSelector(s => s.peliculas.lista), salas = useAppSelector(s => s.salas.lista);
  const existente = peliculas.find(p => p.codigo === route.params?.codigo);
  const dispatch = useAppDispatch(), dialog = useDialog();
  const { interaccionNativa } = useSesionPersonal();
  const [codigo, setCodigo] = useState(existente?.codigo ?? sugerirCodigo(peliculas.map(p => p.codigo)));
  const [nombre, setNombre] = useState(existente?.nombre ?? '');
  const [genero, setGenero] = useState(existente?.genero ?? '');
  const [duracion, setDuracion] = useState(existente ? String(existente.duracion) : '');
  const [clasificacion, setClasificacion] = useState(existente?.clasificacion ?? '');
  const [sala, setSala] = useState(existente?.salaAsignada ?? salas[0]?.id ?? '');
  const [precio, setPrecio] = useState(existente ? String(existente.precio) : '');
  const [estado, setEstado] = useState<EstadoPelicula>(existente?.estado ?? 'Disponible');
  const [imagen, setImagen] = useState(existente?.imagen);
  const [preview, setPreview] = useState<string>();
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [seleccionando, setSeleccionando] = useState(false);
  const guardada = React.useRef(false);
  async function elegirImagen() {
    if (seleccionando || guardando) return;
    setSeleccionando(true);
    try {
      const resultado = await interaccionNativa(() => ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [2, 3], quality: 0.8 }));
      if (!resultado.canceled && resultado.assets?.[0]) { setPreview(resultado.assets[0].uri); setError(''); }
    } catch { dialog.alert('No se pudo abrir la galería', 'Revisa los permisos de fotos de la aplicación en los ajustes del teléfono e intenta nuevamente.'); }
    finally { setSeleccionando(false); }
  }
  async function guardar() {
    if (guardando || seleccionando) return;
    const p: Pelicula = { codigo: codigo.trim(), nombre: nombre.trim(), genero, duracion: Number(duracion), clasificacion, salaAsignada: sala, precio: Math.round(Number(precio.replace(',', '.')) * 100) / 100, estado, imagen };
    const err = !precio.trim() || Number(precio.replace(',', '.')) < 0 ? 'Escribe un precio mayor o igual a cero.' : errorPelicula(p, peliculas, !!existente || guardada.current);
    if (err) { setError(err); dialog.alert('Revisa los datos', err); return; }
    setGuardando(true);
    try {
      if (preview) { p.imagen = await guardarPoster(preview); setImagen(p.imagen); setPreview(undefined); }
      dispatch(existente || guardada.current ? editarPelicula(p) : agregarPelicula(p));
      guardada.current = true;
      await guardarEstado();
      dialog.alert('Película guardada', existente ? 'Los cambios ya están disponibles en la cartelera.' : 'La película está lista. Programa una función para habilitar la compra.', [{ text: 'Continuar', onPress: () => navigation.goBack() }]);
    } catch { setError('No se pudo guardar la imagen o los datos. Reintenta sin cerrar la aplicación.'); }
    finally { setGuardando(false); }
  }
  // Los valores antiguos siguen visibles al editar, aunque no pertenezcan a la lista inicial.
  const opciones = (lista: string[], actual: string) => Array.from(new Set([...lista, ...(actual ? [actual] : [])])).map(x => ({ label: x, value: x }));
  return <ScrollView style={s.root} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
    <Text style={s.eyebrow}>GESTIÓN DE CARTELERA</Text><Text style={s.title}>{existente ? 'Editar película' : 'Una nueva historia'}</Text>
    <Text style={s.subtitle}>Completa los detalles que verán tus clientes.</Text>
    <View style={s.cover}><View style={s.poster}><Poster nombre={nombre} genero={genero} imagen={imagen} preview={preview} /></View>
      <TouchableOpacity disabled={guardando || seleccionando} accessibilityRole="button" style={s.imageButton} onPress={elegirImagen}><Icon name="image-plus" size={20} /><Text style={s.imageText}>{seleccionando ? 'Abriendo galería...' : 'Elegir imagen de la galería'}</Text></TouchableOpacity>
      {(imagen || preview) && <TouchableOpacity disabled={guardando} style={s.remove} onPress={() => { setImagen(undefined); setPreview(undefined); }}><Text style={s.hint}>Usar portada predeterminada</Text></TouchableOpacity>}
      <Text style={s.hint}>Opcional · Recomendado: póster vertical 2:3</Text>
    </View>
    <Campo label="Código" value={codigo} onChangeText={setCodigo} editable={!existente && !guardada.current} placeholder="Ej. COD006" hint={existente ? 'El código identifica la película y no se cambia.' : 'Código único sugerido. Puedes modificarlo.'} />
    <Campo label="Nombre de la película" value={nombre} onChangeText={setNombre} placeholder="Ej. Una noche de película" />
    <Select label="Género" value={genero} options={opciones(GENEROS, genero)} onChange={setGenero} />
    <Select label="Clasificación" value={clasificacion} options={opciones(CLASIFICACIONES, clasificacion)} onChange={setClasificacion} hint="Selecciona la clasificación indicada para la película." />
    <Campo label="Duración (minutos)" value={duracion} onChangeText={setDuracion} placeholder="Ej. 120" keyboardType="number-pad" />
    <Select label="Sala asignada" value={sala} options={salas.map(x => ({ label: x.nombre, value: x.id }))} onChange={setSala} />
    <Campo label="Precio por entrada ($)" value={precio} onChangeText={setPrecio} placeholder="Ej. 4.50" keyboardType="decimal-pad" />
    <Select label="Estado" value={estado} options={['Disponible','No disponible'].map(x => ({ label: x, value: x }))} onChange={x => setEstado(x as EstadoPelicula)} />
    {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
    <TouchableOpacity disabled={guardando || seleccionando} accessibilityRole="button" style={s.save} onPress={guardar}>{guardando ? <ActivityIndicator color={c.primaryText} /> : <Icon name="content-save-outline" size={21} color={c.primaryText} />}<Text style={s.saveText}>{guardando ? 'Guardando...' : 'Guardar película'}</Text></TouchableOpacity>
  </ScrollView>;
}
function Campo({ label, hint, ...props }: React.ComponentProps<typeof TextInput> & { label: string; hint?: string }) {
  return <View style={s.field}><Text style={s.label}>{label}</Text><TextInput {...props} accessibilityLabel={label} placeholderTextColor={c.muted} selectionColor={c.primary} style={[s.input, props.editable === false && { opacity: 0.65 }]} />{!!hint && <Text style={s.hint}>{hint}</Text>}</View>;
}
const s = StyleSheet.create({ root: { flex: 1, backgroundColor: c.background }, content: { padding: 20, paddingBottom: 48 },
  eyebrow: { color: c.primary, fontSize: 10, letterSpacing: 2, marginBottom: 10 }, title: { color: c.text, fontSize: 28, fontWeight: '800' }, subtitle: { color: c.muted, lineHeight: 22, marginTop: 8, marginBottom: 24 },
  cover: { alignItems: 'center', backgroundColor: c.surface, borderRadius: 18, padding: 18, marginBottom: 24, borderWidth: 1, borderColor: c.border }, poster: { width: 160 },
  imageButton: { flexDirection: 'row', gap: 8, paddingVertical: 15, alignItems: 'center' }, imageText: { color: c.primary, fontWeight: '600', flexShrink: 1 }, remove: { padding: 8 },
  field: { marginBottom: 18 }, label: { color: c.text, fontWeight: '600', fontSize: 14, marginBottom: 8 }, input: { minHeight: 52, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: c.border, color: c.text, fontSize: 16, backgroundColor: c.surface }, hint: { color: c.muted, fontSize: 12, lineHeight: 18, marginTop: 6 },
  save: { backgroundColor: c.primary, borderRadius: 12, padding: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }, saveText: { color: c.primaryText, fontWeight: '700', fontSize: 16 }, error: { color: c.danger, marginBottom: 16, lineHeight: 22 },
});
