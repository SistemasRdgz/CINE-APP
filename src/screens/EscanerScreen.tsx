import { colors } from '../ui/theme';
import React, { useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Linking, ActivityIndicator } from 'react-native';
import { Text } from '../ui/Typography';

import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { useIsFocused } from '@react-navigation/native';
import { useAppDispatch } from '../redux/hooks';
import { validarQR } from '../redux/operaciones';
import { guardarEstado } from '../redux/store';

export default function EscanerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const focused = useIsFocused();
  const dispatch = useAppDispatch();
  const bloqueado = useRef(false);
  const [resultado, setResultado] = useState<{ ok: boolean; mensaje: string } | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [errorCamara, setErrorCamara] = useState('');
  const [errorGuardado, setErrorGuardado] = useState(false);

  async function guardar() {
    setGuardando(true);
    try { await guardarEstado(); setErrorGuardado(false); }
    catch { setErrorGuardado(true); }
    finally { setGuardando(false); }
  }
  async function escanear({ data }: BarcodeScanningResult) {
    if (bloqueado.current) return;
    bloqueado.current = true;
    const r = dispatch(validarQR(data));
    setResultado(r);
    if (r.ok) await guardar();
  }
  async function pedirPermiso() {
    try { await requestPermission(); }
    catch { setErrorCamara('No se pudo solicitar acceso a la cámara. Intenta nuevamente.'); }
  }
  if (!permission) return <View style={styles.center}><ActivityIndicator /></View>;
  if (!permission.granted) return <View style={styles.center}>
    <Text style={styles.title}>Permiso de cámara</Text>
    <Text style={styles.text}>La cámara se utiliza para leer el QR y registrar el ingreso del cliente.</Text>
    <TouchableOpacity style={styles.button} onPress={permission.canAskAgain ? pedirPermiso : () => { Linking.openSettings().catch(() => setErrorCamara('Abre los ajustes del teléfono y permite la cámara para esta aplicación.')); }}>
      <Text style={styles.buttonText}>{permission.canAskAgain ? 'Permitir cámara' : 'Abrir ajustes'}</Text>
    </TouchableOpacity>
    {!!errorCamara && <Text style={styles.error}>{errorCamara}</Text>}
  </View>;
  return <View style={styles.root}>
    <Text style={styles.title}>Validar entrada</Text>
    <Text style={styles.text}>Apunta al QR. Una lectura válida registra como utilizada toda la reserva.</Text>
    {resultado ? <View style={[styles.result, { backgroundColor: resultado.ok ? colors.raised : colors.wineSoft }]}>
      <Text style={styles.title}>{resultado.ok ? 'Ingreso registrado' : 'Boleto rechazado'}</Text>
      <Text style={styles.text}>{resultado.mensaje}</Text>
      {guardando && <ActivityIndicator />}
      {errorGuardado ? <>
        <Text style={styles.error}>No se pudo guardar el cambio en el dispositivo. Reintenta antes de cerrar la app.</Text>
        <TouchableOpacity style={styles.button} onPress={guardar}><Text style={styles.buttonText}>Reintentar guardado</Text></TouchableOpacity>
      </> : <TouchableOpacity disabled={guardando} style={styles.button} onPress={() => { setResultado(null); bloqueado.current = false; }}>
        <Text style={styles.buttonText}>Escanear otro boleto</Text>
      </TouchableOpacity>}
    </View> : errorCamara ? <View style={styles.result}>
      <Text style={styles.error}>{errorCamara}</Text>
      <TouchableOpacity style={styles.button} onPress={() => setErrorCamara('')}><Text style={styles.buttonText}>Reintentar cámara</Text></TouchableOpacity>
    </View> : focused && <CameraView style={styles.camera} facing="back" barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={escanear} onMountError={() => setErrorCamara('No se pudo abrir la cámara. Comprueba que ninguna otra app la esté usando.')} />}
  </View>;
}
const styles = StyleSheet.create({
  root: { flex: 1, padding: 16, backgroundColor: colors.background }, center: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 21, fontWeight: '700', color: colors.primary, marginBottom: 12 },
  text: { fontSize: 15, lineHeight: 23, color: colors.text, marginBottom: 16 },
  camera: { flex: 1, minHeight: 200, marginBottom: 16 }, result: { padding: 20, borderRadius: 12 },
  button: { backgroundColor: colors.primary, padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  buttonText: { color: colors.primaryText, fontWeight: '700' }, error: { color: colors.danger, marginTop: 12 },
});
