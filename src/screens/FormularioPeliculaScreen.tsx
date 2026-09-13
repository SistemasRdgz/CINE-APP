import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { agregarPelicula, editarPelicula } from '../redux/slices/peliculasSlice';
import { RootStackParamList } from '../navigation/types';
import { Pelicula, EstadoPelicula } from '../types/pelicula';

export default function FormularioPeliculaScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'FormularioPelicula'>>();
  const codigoEdicion = route.params?.codigo;

  const dispatch = useAppDispatch();
  const peliculas = useAppSelector((state) => state.peliculas.lista);
  const salas = useAppSelector((state) => state.salas.lista);

  const peliculaExistente = peliculas.find((p) => p.codigo === codigoEdicion);
  const esEdicion = !!peliculaExistente;

  const [codigo, setCodigo] = useState(peliculaExistente?.codigo ?? '');
  const [nombre, setNombre] = useState(peliculaExistente?.nombre ?? '');
  const [genero, setGenero] = useState(peliculaExistente?.genero ?? '');
  const [duracion, setDuracion] = useState(
    peliculaExistente ? String(peliculaExistente.duracion) : ''
  );
  const [clasificacion, setClasificacion] = useState(peliculaExistente?.clasificacion ?? '');
  const [salaAsignada, setSalaAsignada] = useState(
    peliculaExistente?.salaAsignada ?? salas[0]?.id ?? ''
  );
  const [precio, setPrecio] = useState(
    peliculaExistente ? String(peliculaExistente.precio) : ''
  );
  const [estado, setEstado] = useState<EstadoPelicula>(peliculaExistente?.estado ?? 'Disponible');
  const [errores, setErrores] = useState<string[]>([]);

  const validar = (): string[] => {
    const errs: string[] = [];
    if (!codigo.trim()) errs.push('El código es obligatorio.');
    if (!esEdicion && peliculas.some((p) => p.codigo.trim() === codigo.trim())) {
      errs.push('Ya existe una película con ese código.');
    }
    if (!nombre.trim()) errs.push('El nombre es obligatorio.');
    if (!genero.trim()) errs.push('El género es obligatorio.');
    if (!clasificacion.trim()) errs.push('La clasificación es obligatoria.');
    if (!salaAsignada.trim()) errs.push('Debes asignar una sala.');
    const duracionNum = Number(duracion);
    if (!duracion || isNaN(duracionNum) || duracionNum <= 0) {
      errs.push('La duración debe ser un número mayor a 0.');
    }
    const precioNum = Number(precio);
    if (precio === '' || isNaN(precioNum) || precioNum < 0) {
      errs.push('El precio no puede ser negativo ni estar vacío.');
    }
    return errs;
  };

  const guardar = () => {
    const errs = validar();
    setErrores(errs);
    if (errs.length > 0) return;

    const pelicula: Pelicula = {
      codigo: codigo.trim(),
      nombre: nombre.trim(),
      genero: genero.trim(),
      duracion: Number(duracion),
      clasificacion: clasificacion.trim(),
      salaAsignada: salaAsignada.trim(),
      precio: Number(precio),
      estado,
    };

    if (esEdicion) {
      dispatch(editarPelicula(pelicula));
    } else {
      dispatch(agregarPelicula(pelicula));
    }
    Alert.alert('Listo', esEdicion ? 'Película actualizada.' : 'Película agregada.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <ScrollView style={styles.contenedor} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.titulo}>{esEdicion ? 'Editar película' : 'Nueva película'}</Text>

      {errores.length > 0 && (
        <View style={styles.cajaError}>
          {errores.map((e, i) => (
            <Text key={i} style={styles.textoError}>
              • {e}
            </Text>
          ))}
        </View>
      )}

      <Campo label="Código" valor={codigo} onCambiar={setCodigo} editable={!esEdicion} />
      <Campo label="Nombre" valor={nombre} onCambiar={setNombre} />
      <Campo label="Género" valor={genero} onCambiar={setGenero} />
      <Campo label="Duración (min)" valor={duracion} onCambiar={setDuracion} teclado="numeric" />
      <Campo label="Clasificación" valor={clasificacion} onCambiar={setClasificacion} />

      <Text style={styles.label}>Sala asignada</Text>
      <View style={styles.filaOpciones}>
        {salas.map((s) => (
          <TouchableOpacity
            key={s.id}
            style={[styles.opcion, salaAsignada === s.id && styles.opcionActiva]}
            onPress={() => setSalaAsignada(s.id)}
          >
            <Text
              style={[
                styles.opcionTexto,
                salaAsignada === s.id && styles.opcionTextoActiva,
              ]}
            >
              {s.nombre}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Campo label="Precio ($)" valor={precio} onCambiar={setPrecio} teclado="decimal-pad" />

      <Text style={styles.label}>Estado</Text>
      <View style={styles.filaOpciones}>
        {(['Disponible', 'No disponible'] as EstadoPelicula[]).map((e) => (
          <TouchableOpacity
            key={e}
            style={[styles.opcion, estado === e && styles.opcionActiva]}
            onPress={() => setEstado(e)}
          >
            <Text style={[styles.opcionTexto, estado === e && styles.opcionTextoActiva]}>{e}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.botonGuardar} onPress={guardar}>
        <Text style={styles.botonGuardarTexto}>{esEdicion ? 'Guardar cambios' : 'Agregar'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Campo({
  label,
  valor,
  onCambiar,
  editable = true,
  teclado,
}: {
  label: string;
  valor: string;
  onCambiar: (v: string) => void;
  editable?: boolean;
  teclado?: 'default' | 'numeric' | 'decimal-pad';
}) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, !editable && styles.inputDeshabilitado]}
        value={valor}
        onChangeText={onCambiar}
        editable={editable}
        keyboardType={teclado ?? 'default'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#fff' },
  titulo: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  inputDeshabilitado: { backgroundColor: '#f0f0f0', color: '#888' },
  filaOpciones: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  opcion: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#eee',
    marginRight: 8,
    marginBottom: 8,
  },
  opcionActiva: { backgroundColor: '#1E3A8A' },
  opcionTexto: { color: '#333', fontSize: 13 },
  opcionTextoActiva: { color: '#fff', fontWeight: '600' },
  cajaError: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  textoError: { color: '#B91C1C', fontSize: 13 },
  botonGuardar: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  botonGuardarTexto: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
