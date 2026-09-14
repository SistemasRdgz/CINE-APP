import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { useSesionPersonal } from '../auth/SesionPersonal';

export default function AccesoPersonalScreen() {
  const { entrar } = useSesionPersonal();
  const [verificando, setVerificando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const autenticar = async () => {
    setMensaje('');
    setVerificando(true);
    try {
      const tieneHardware = await LocalAuthentication.hasHardwareAsync();
      if (!tieneHardware) {
        setMensaje('Este dispositivo no cuenta con sensor biométrico.');
        setVerificando(false);
        return;
      }

      const tieneRegistrada = await LocalAuthentication.isEnrolledAsync();
      if (!tieneRegistrada) {
        setMensaje(
          'No hay huella dactilar ni Face ID configurados en este dispositivo/emulador.'
        );
        setVerificando(false);
        return;
      }

      const resultado = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Verifica tu identidad para acceder a la Zona de Personal',
        disableDeviceFallback: true,
        biometricsSecurityLevel: 'strong',
        fallbackLabel: '',
        cancelLabel: 'Cancelar',
      });

      setVerificando(false);

      if (resultado.success) {
        entrar();
      } else {
        setMensaje('No se pudo verificar tu identidad. Inténtalo de nuevo.');
      }
    } catch (err) {
      setVerificando(false);
      setMensaje('Ocurrió un error al intentar autenticar.');
    }
  };

  return (
    <View style={styles.contenedor}>
      <Text style={styles.icono}>🔒</Text>
      <Text style={styles.titulo}>Zona de Personal</Text>
      <Text style={styles.subtitulo}>
        Esta sección es de uso exclusivo del staff del cine. Se requiere autenticación
        biométrica (huella dactilar o Face ID) para continuar.
      </Text>

      {verificando ? (
        <ActivityIndicator size="large" color="#1E3A8A" style={{ marginTop: 24 }} />
      ) : (
        <TouchableOpacity style={styles.boton} onPress={autenticar}>
          <Text style={styles.botonTexto}>Autenticarse</Text>
        </TouchableOpacity>
      )}

      {mensaje !== '' && <Text style={styles.mensajeError}>{mensaje}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  icono: { fontSize: 48, marginBottom: 12 },
  titulo: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  subtitulo: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 24 },
  boton: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  botonTexto: { color: '#fff', fontWeight: '700', fontSize: 15 },
  mensajeError: { color: '#B91C1C', marginTop: 16, textAlign: 'center', fontSize: 13 },
});
