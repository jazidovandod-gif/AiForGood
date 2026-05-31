import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { colors } from '../theme/colors';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    console.log('Intento de login con:', username);
    // TODO: Implementar llamada a API con device_id (ver agente REACT_DEVICE)
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.brandContainer}>
          {/* Reemplazar con el ícono/SVG real del símbolo Venado */}
          <View style={styles.logoPlaceholder} />
          
          <View style={styles.wordmarkContainer}>
            <Text style={styles.wordmarkTop}>INDUSTRIAS</Text>
            <Text style={styles.wordmarkBottom}>VENADO</Text>
          </View>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>ACCESO LOGÍSTICA PRO</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Usuario (Ej. rep-01)"
            placeholderTextColor={colors.outlineVariant}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor={colors.outlineVariant}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin} activeOpacity={0.8}>
            <Text style={styles.buttonText}>INICIAR SESIÓN</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoPlaceholder: {
    width: 64,
    height: 64,
    backgroundColor: colors.primary,
    borderRadius: 8,
    marginBottom: 16,
  },
  wordmarkContainer: {
    alignItems: 'center',
  },
  wordmarkTop: {
    fontFamily: 'HankenGrotesk_700Bold',
    fontSize: 14, // Cuerpo pequeño, uppercase, tracking simulado
    letterSpacing: 2,
    color: colors.primary,
  },
  wordmarkBottom: {
    fontFamily: 'HankenGrotesk_800ExtraBold',
    fontSize: 28,
    letterSpacing: -0.5,
    color: colors.primary,
    marginTop: -4,
  },
  formContainer: {
    backgroundColor: colors.white,
    padding: 24,
    borderRadius: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  label: {
    fontFamily: 'HankenGrotesk_700Bold',
    fontSize: 13,
    letterSpacing: 1.3,
    color: colors.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    height: 56,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 4,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontFamily: 'HankenGrotesk_400Regular',
    fontSize: 17,
    color: colors.black,
  },
  button: {
    height: 56,
    backgroundColor: colors.secondary, // Verde Confirmación
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontFamily: 'HankenGrotesk_700Bold',
    color: colors.white,
    fontSize: 18,
    letterSpacing: 1.5,
  },
});
