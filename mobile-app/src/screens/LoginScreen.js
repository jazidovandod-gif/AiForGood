import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { BACKEND_URL } from '../constants/api';

export default function LoginScreen({ navigation }) {
  const { deviceId, login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin() {
    if (!username.trim() || !password.trim()) {
      setError('Completa usuario y contraseña.');
      return;
    }
    setError('');
    setLoading(true);

    // Aborta el request si el servidor no responde en 10s (evita spinner infinito)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      // 1. Autenticar
      const authRes = await fetch(`${BACKEND_URL}/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password, device_id: deviceId }),
        signal: controller.signal,
      });

      const authData = await authRes.json();

      if (!authRes.ok) {
        setError('Usuario o contraseña incorrectos.');
        return;
      }

      const accessToken = authData.access;

      // 2. Verificar que sea reponedor — solo tienen ruta asignada
      const rutaRes = await fetch(`${BACKEND_URL}/api/logistica/rutas/hoy/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'X-Device-ID': deviceId,
        },
        signal: controller.signal,
      });

      if (rutaRes.status === 404) {
        setError('Esta app es exclusiva para reponedores. No tienes una ruta asignada.');
        return;
      }

      if (!rutaRes.ok) {
        setError('Error al verificar tu ruta. Intenta de nuevo.');
        return;
      }

      await login(accessToken);
    } catch (e) {
      if (e.name === 'AbortError') {
        setError(`El servidor no responde (${BACKEND_URL}). ¿Misma red WiFi?`);
      } else {
        setError('Sin conexión al servidor. Verifica tu red.');
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.brandContainer}>
          <View style={styles.logoPlaceholder} />
          <View style={styles.wordmarkContainer}>
            <Text style={styles.wordmarkTop}>INDUSTRIAS</Text>
            <Text style={styles.wordmarkBottom}>VENADO</Text>
          </View>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>ACCESO LOGÍSTICA PRO</Text>

          {!!error && <Text style={styles.errorText}>{error}</Text>}

          <TextInput
            style={styles.input}
            placeholder="Usuario (Ej. reponedor1)"
            placeholderTextColor={colors.outlineVariant}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor={colors.outlineVariant}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={colors.white} />
              : <Text style={styles.buttonText}>INICIAR SESIÓN</Text>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  keyboardView: { flex: 1, justifyContent: 'center', padding: 24 },
  brandContainer: { alignItems: 'center', marginBottom: 48 },
  logoPlaceholder: {
    width: 64, height: 64,
    backgroundColor: colors.primary,
    borderRadius: 8, marginBottom: 16,
  },
  wordmarkContainer: { alignItems: 'center' },
  wordmarkTop: {
    fontFamily: 'HankenGrotesk_700Bold',
    fontSize: 14, letterSpacing: 2, color: colors.primary,
  },
  wordmarkBottom: {
    fontFamily: 'HankenGrotesk_800ExtraBold',
    fontSize: 28, letterSpacing: -0.5, color: colors.primary, marginTop: -4,
  },
  formContainer: {
    backgroundColor: colors.white, padding: 24, borderRadius: 12,
    shadowColor: colors.black, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  label: {
    fontFamily: 'HankenGrotesk_700Bold',
    fontSize: 13, letterSpacing: 1.3, color: colors.primary,
    marginBottom: 16, textAlign: 'center',
  },
  errorText: {
    fontFamily: 'HankenGrotesk_400Regular',
    fontSize: 13, color: colors.error,
    marginBottom: 12, textAlign: 'center',
  },
  input: {
    height: 56, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.outlineVariant,
    borderRadius: 4, paddingHorizontal: 16, marginBottom: 16,
    fontFamily: 'HankenGrotesk_400Regular', fontSize: 17, color: colors.black,
  },
  button: {
    height: 56, backgroundColor: colors.secondary,
    borderRadius: 4, justifyContent: 'center', alignItems: 'center', marginTop: 8,
  },
  buttonDisabled: { backgroundColor: colors.outlineVariant },
  buttonText: {
    fontFamily: 'HankenGrotesk_700Bold',
    color: colors.white, fontSize: 18, letterSpacing: 1.5,
  },
});
