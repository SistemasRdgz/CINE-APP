import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ActivityIndicator, View } from 'react-native';

import { SesionPersonalProvider } from './src/auth/SesionPersonal';
import { store, persistor } from './src/redux/store';
import { DialogProvider } from './src/ui/Dialog';
import { navigationTheme, colors } from './src/ui/theme';
import AppNavigator from './src/navigation/AppNavigator';

function CargandoPantalla() {
  return (
    <View style={{ backgroundColor: colors.background, flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<CargandoPantalla />} persistor={persistor}>
        <SesionPersonalProvider>
        <DialogProvider>
        <NavigationContainer theme={navigationTheme}>
          <StatusBar style="light" />
          <AppNavigator />
        </NavigationContainer>
        </DialogProvider>
        </SesionPersonalProvider>
      </PersistGate>
    </Provider>
  );
}
