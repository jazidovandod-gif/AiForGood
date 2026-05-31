import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text } from 'react-native';
import { useFonts } from 'expo-font';
import { 
  HankenGrotesk_400Regular, 
  HankenGrotesk_500Medium, 
  HankenGrotesk_600SemiBold, 
  HankenGrotesk_700Bold, 
  HankenGrotesk_800ExtraBold 
} from '@expo-google-fonts/hanken-grotesk';

import LoginScreen from './src/screens/LoginScreen';

export default function App() {
  let [fontsLoaded] = useFonts({
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
    HankenGrotesk_800ExtraBold,
  });

  if (!fontsLoaded) {
    // Podríamos mostrar un AppLoading de Expo aquí, por ahora una vista vacía
    return <View style={styles.container}><Text>Cargando tipografía...</Text></View>;
  }

  return (
    <>
      <StatusBar style="auto" />
      <LoginScreen />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

