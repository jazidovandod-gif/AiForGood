import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import { getSecureLocation } from '../hooks/useSecureLocation';

const STATUS_CONFIG = {
  pending:     { label: 'PENDIENTE',   color: colors.outlineVariant },
  in_progress: { label: 'EN VISITA',   color: colors.surfaceTint },
  completed:   { label: 'COMPLETADO',  color: colors.secondary },
  skipped:     { label: 'OMITIDO',     color: colors.error },
};

export default function HomeScreen({ navigation }) {
  const { logout } = useAuth();
  const { apiFetch } = useApi();
  const [ruta, setRuta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(null); // stop_id en proceso

  useFocusEffect(
    useCallback(() => {
      cargarRuta();
    }, [])
  );

  async function cargarRuta() {
    setLoading(true);
    try {
      const res = await apiFetch('/api/logistica/rutas/hoy/');
      if (res.ok) setRuta(await res.json());
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }

  async function iniciarRuta() {
    try {
      await apiFetch(`/api/logistica/rutas/${ruta.id}/iniciar/`, { method: 'POST' });
      cargarRuta();
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  }

  async function hacerCheckin(stop) {
    setCheckingIn(stop.id);
    try {
      const gps = await getSecureLocation();

      const res = await apiFetch('/api/logistica/checkin/', {
        method: 'POST',
        body: JSON.stringify({ route_stop_id: stop.id, ...gps }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert('Check-in rechazado', data.detail || JSON.stringify(data));
        return;
      }

      Alert.alert('✅ Check-in exitoso', 'Has llegado al punto de venta.');
      cargarRuta();
    } catch (e) {
      if (e.message === 'MOCK_LOCATION') {
        Alert.alert('🚫 Fraude detectado', 'Se detectó una app de GPS falso. El check-in fue bloqueado.');
      } else if (e.message === 'VELOCIDAD_IMPOSIBLE') {
        Alert.alert('🚫 Velocidad anómala', 'Tu velocidad actual es imposible. Antispoofing activado.');
      } else {
        Alert.alert('Error GPS', e.message);
      }
    } finally {
      setCheckingIn(null);
    }
  }

  async function completarParada(stop) {
    try {
      const res = await apiFetch(`/api/logistica/paradas/${stop.id}/completar/`, {
        method: 'POST',
        body: JSON.stringify({}),
      });
      if (res.ok) {
        Alert.alert('✅ Parada completada');
        cargarRuta();
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  }

  async function omitirParada(stop) {
    Alert.alert(
      'Omitir parada',
      `¿Seguro que deseas omitir PDV ${stop.pdv.code}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Omitir',
          style: 'destructive',
          onPress: async () => {
            await apiFetch(`/api/logistica/paradas/${stop.id}/omitir/`, { method: 'POST' });
            cargarRuta();
          },
        },
      ]
    );
  }

  function renderStop({ item: stop }) {
    const cfg = STATUS_CONFIG[stop.status] ?? STATUS_CONFIG.pending;
    const isPending = stop.status === 'pending';
    const isInProgress = stop.status === 'in_progress';
    const isCheckingThisStop = checkingIn === stop.id;

    return (
      <View style={styles.stopCard}>
        <View style={styles.stopHeader}>
          <Text style={styles.stopOrder}>#{stop.stop_order}</Text>
          <View style={[styles.badge, { backgroundColor: cfg.color }]}>
            <Text style={styles.badgeText}>{cfg.label}</Text>
          </View>
        </View>

        <Text style={styles.stopTitle}>PDV {stop.pdv.code}</Text>
        <Text style={styles.stopMarket}>{stop.pdv.market_name}</Text>

        <View style={styles.stopMeta}>
          <Text style={styles.metaText}>⏱ {stop.pdv.visit_minutes_estimated} min</Text>
          <Text style={styles.metaText}>
            📍 {stop.pdv.lat.toFixed(4)}, {stop.pdv.lng.toFixed(4)}
          </Text>
        </View>

        {isPending && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.btnCheckin, isCheckingThisStop && styles.btnDisabled]}
              onPress={() => hacerCheckin(stop)}
              disabled={isCheckingThisStop}
            >
              {isCheckingThisStop
                ? <ActivityIndicator color={colors.white} size="small" />
                : <Text style={styles.btnText}>CHECK-IN GPS</Text>
              }
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnOmitir} onPress={() => omitirParada(stop)}>
              <Text style={[styles.btnText, { color: colors.error }]}>OMITIR</Text>
            </TouchableOpacity>
          </View>
        )}

        {isInProgress && (
          <TouchableOpacity style={styles.btnCompletar} onPress={() => completarParada(stop)}>
            <Text style={styles.btnText}>MARCAR COMPLETADO</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!ruta) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No tienes ruta asignada para hoy.</Text>
        <TouchableOpacity onPress={logout} style={styles.btnLogout}>
          <Text style={[styles.btnText, { color: colors.primary }]}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const pendientes = ruta.stops.filter(s => s.status === 'pending').length;
  const completados = ruta.stops.filter(s => s.status === 'completed').length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Ruta del día</Text>
          <Text style={styles.headerSub}>{ruta.route_date} · {ruta.total_pdvs} PDVs</Text>
        </View>
        <TouchableOpacity
          style={styles.btnMapa}
          onPress={() => navigation.navigate('Map', { ruta })}
        >
          <Text style={styles.btnMapaText}>VER MAPA →</Text>
        </TouchableOpacity>
      </View>

      {/* Banner de progreso */}
      <View style={styles.progressBanner}>
        <Text style={styles.progressText}>
          ✅ {completados} completados · ⏳ {pendientes} pendientes · ⏱ {ruta.total_estimated_minutes} min total
        </Text>
        {ruta.status === 'pending' && (
          <TouchableOpacity style={styles.btnIniciar} onPress={iniciarRuta}>
            <Text style={styles.btnIniciarText}>INICIAR RUTA</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={ruta.stops}
        keyExtractor={s => s.id}
        renderItem={renderStop}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={cargarRuta} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyText: { fontFamily: 'HankenGrotesk_400Regular', color: colors.onSurfaceVariant, marginBottom: 16 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 14,
  },
  headerTitle: { fontFamily: 'HankenGrotesk_700Bold', fontSize: 18, color: colors.white },
  headerSub: { fontFamily: 'HankenGrotesk_400Regular', fontSize: 13, color: colors.inversePrimary },
  btnMapa: { backgroundColor: colors.surfaceTint, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 8 },
  btnMapaText: { fontFamily: 'HankenGrotesk_700Bold', color: colors.white, fontSize: 13 },

  progressBanner: {
    backgroundColor: colors.primaryContainer, padding: 12, alignItems: 'center', gap: 8,
  },
  progressText: { fontFamily: 'HankenGrotesk_400Regular', color: colors.white, fontSize: 13 },
  btnIniciar: { backgroundColor: colors.secondary, borderRadius: 6, paddingHorizontal: 20, paddingVertical: 8 },
  btnIniciarText: { fontFamily: 'HankenGrotesk_700Bold', color: colors.white, fontSize: 14, letterSpacing: 1 },

  list: { padding: 12, gap: 10 },

  stopCard: {
    backgroundColor: colors.white, borderRadius: 10, padding: 16,
    shadowColor: colors.black, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  stopHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  stopOrder: { fontFamily: 'HankenGrotesk_600SemiBold', fontSize: 14, color: colors.onSurfaceVariant },
  badge: { borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontFamily: 'HankenGrotesk_700Bold', fontSize: 11, color: colors.white, letterSpacing: 0.5 },
  stopTitle: { fontFamily: 'HankenGrotesk_700Bold', fontSize: 17, color: colors.black, marginBottom: 2 },
  stopMarket: { fontFamily: 'HankenGrotesk_400Regular', fontSize: 14, color: colors.onSurfaceVariant, marginBottom: 8 },
  stopMeta: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  metaText: { fontFamily: 'HankenGrotesk_400Regular', fontSize: 13, color: colors.onSurfaceVariant },

  actions: { flexDirection: 'row', gap: 10 },
  btnCheckin: {
    flex: 1, backgroundColor: colors.primary, borderRadius: 6,
    paddingVertical: 10, alignItems: 'center',
  },
  btnOmitir: {
    borderWidth: 1, borderColor: colors.error, borderRadius: 6,
    paddingVertical: 10, paddingHorizontal: 16, alignItems: 'center',
  },
  btnCompletar: {
    backgroundColor: colors.secondary, borderRadius: 6,
    paddingVertical: 10, alignItems: 'center',
  },
  btnDisabled: { backgroundColor: colors.outlineVariant },
  btnText: { fontFamily: 'HankenGrotesk_700Bold', color: colors.white, fontSize: 14, letterSpacing: 0.5 },
  btnLogout: { marginTop: 12 },
});
