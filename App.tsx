import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ActivityIndicator, View } from 'react-native';
import { SesionPersonalProvider } from './src/auth/SesionPersonal';
import { store, persistor } from './src/redux/store';
import { DialogProvider } from './src/ui/Dialog';
import { useTheme, getNavigationTheme, darkColors } from './src/ui/theme';
import ThemeProvider from './src/ui/ThemeProvider';
import AppNavigator from './src/navigation/AppNavigator';
function Interfaz() {
  const { colors, tema } = useTheme();
  const theme = React.useMemo(() => getNavigationTheme(tema, colors), [tema, colors]);
  return <SesionPersonalProvider><DialogProvider><NavigationContainer theme={theme}>
    <StatusBar style={tema === 'oscuro' ? 'light' : 'dark'} backgroundColor={colors.background} />
    <AppNavigator />
  </NavigationContainer></DialogProvider></SesionPersonalProvider>;
}
export default function App() {
  return <Provider store={store}>
    <PersistGate loading={<View style={{ flex: 1, backgroundColor: darkColors.background, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator color={darkColors.primary} /></View>} persistor={persistor}>
      <ThemeProvider><Interfaz /></ThemeProvider>
    </PersistGate>
  </Provider>;
}
