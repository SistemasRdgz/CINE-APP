import React from 'react';
import { useSesionPersonal } from '../auth/SesionPersonal';
import FuncionesScreen from '../screens/FuncionesScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList, ClienteTabsParamList } from './types';
import PeliculasScreen from '../screens/PeliculasScreen';
import HistorialScreen from '../screens/HistorialScreen';
import ReservaScreen from '../screens/ReservaScreen';
import MapaAsientosScreen from '../screens/MapaAsientosScreen';
import AccesoPersonalScreen from '../screens/AccesoPersonalScreen';
import PersonalHomeScreen from '../screens/PersonalHomeScreen';
import FormularioPeliculaScreen from '../screens/FormularioPeliculaScreen';
import DashboardScreen from '../screens/DashboardScreen';
import EscanerScreen from '../screens/EscanerScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<ClienteTabsParamList>();

function BotonAccesoPersonal() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <TouchableOpacity
      style={styles.botonDiscreto}
      onPress={() => navigation.navigate('AccesoPersonal')}
    >
      <Text style={styles.botonDiscretoTexto}>Personal</Text>
    </TouchableOpacity>
  );
}

function CatalogoScreen() {
  return <PeliculasScreen modo="cliente" />;
}

function ClienteTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: true }}>
      <Tab.Screen
        name="Catalogo"
        component={CatalogoScreen}
        options={{
          title: 'Cartelera',
          headerRight: () => <BotonAccesoPersonal />,
        }}
      />
      <Tab.Screen
        name="MisBoletos"
        component={HistorialScreen}
        options={{ title: 'Mis Boletos' }}
      />
    </Tab.Navigator>
  );
}

function PersonalPeliculasScreen() {
  return <PeliculasScreen modo="personal" />;
}

export default function AppNavigator() {
  const { autorizado } = useSesionPersonal();
  return (
    <Stack.Navigator initialRouteName="ClienteTabs">
      {!autorizado ? <Stack.Group navigationKey="cliente">
      <Stack.Screen
        name="ClienteTabs"
        component={ClienteTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Reserva"
        component={ReservaScreen}
        options={{ title: 'Reservar boletos' }}
      />
      <Stack.Screen
        name="MapaAsientos"
        component={MapaAsientosScreen}
        options={{ title: 'Selecciona tus asientos' }}
      />
      <Stack.Screen
        name="AccesoPersonal"
        component={AccesoPersonalScreen}
        options={{ title: 'Acceso del personal' }}
      />
      </Stack.Group> : <Stack.Group navigationKey="personal">
      <Stack.Screen
        name="PersonalHome"
        component={PersonalHomeScreen}
        options={{ title: 'Zona de Personal', headerBackVisible: false }}
      />
      <Stack.Screen
        name="PersonalPeliculas"
        component={PersonalPeliculasScreen}
        options={{ title: 'Gestión de Películas' }}
      />
      <Stack.Screen
        name="FormularioPelicula"
        component={FormularioPeliculaScreen}
        options={{ title: 'Película' }}
      />
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
      <Stack.Screen name="Escaner" component={EscanerScreen} options={{ title: 'Escáner QR' }} />
      <Stack.Screen name="Funciones" component={FuncionesScreen} options={{ title: 'Gestión de funciones' }} />
      </Stack.Group>}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  botonDiscreto: { marginRight: 12, paddingHorizontal: 8, paddingVertical: 4 },
  botonDiscretoTexto: { color: '#1E3A8A', fontSize: 13, fontWeight: '600' },
});
