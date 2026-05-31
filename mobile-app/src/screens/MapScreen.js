import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import Constants from 'expo-constants';
import { colors } from '../theme/colors';
import { GOOGLE_MAPS_API_KEY } from '../constants/api';
import { getMapLocation } from '../hooks/useSecureLocation';

// En Expo Go no se puede usar PROVIDER_GOOGLE (requiere build nativo con la API key compilada)
const isExpoGo = Constants.appOwnership === 'expo';
const mapProvider = (!isExpoGo && GOOGLE_MAPS_API_KEY) ? PROVIDER_GOOGLE : undefined;

// Decodifica el formato Encoded Polyline de Google Maps
function decodePolyline(encoded) {
  const points = [];
  let index = 0, lat = 0, lng = 0;
  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lat += (result & 1) ? ~(result >> 1) : result >> 1;
    shift = 0; result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lng += (result & 1) ? ~(result >> 1) : result >> 1;
    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return points;
}

const MARKER_COLORS = {
  pending:     'gray',
  in_progress: '#3A5F94',
  completed:   '#1B6D24',
  skipped:     '#BA1A1A',
};

export default function MapScreen({ route, navigation }) {
  const { ruta } = route.params;
  const mapRef = useRef(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);

  const stops = ruta.stops ?? [];

  // Región inicial centrada en los PDVs
  const initialRegion = stops.length > 0
    ? {
        latitude: stops[0].pdv.lat,
        longitude: stops[0].pdv.lng,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      }
    : { latitude: -16.5, longitude: -68.15, latitudeDelta: 0.1, longitudeDelta: 0.1 };

  useEffect(() => {
    cargarUbicacionUsuario();
    if (GOOGLE_MAPS_API_KEY) {
      cargarRutaGoogleMaps();
    }
  }, []);

  async function cargarUbicacionUsuario() {
    const loc = await getMapLocation();
    if (loc) setUserLocation(loc);
  }

  async function cargarRutaGoogleMaps() {
    const stopsOrdenados = [...stops].sort((a, b) => a.stop_order - b.stop_order);
    if (stopsOrdenados.length < 2) return;

    setLoadingRoute(true);
    try {
      const origin = `${stopsOrdenados[0].pdv.lat},${stopsOrdenados[0].pdv.lng}`;
      const destination = `${stopsOrdenados.at(-1).pdv.lat},${stopsOrdenados.at(-1).pdv.lng}`;
      const waypoints = stopsOrdenados
        .slice(1, -1)
        .map(s => `${s.pdv.lat},${s.pdv.lng}`)
        .join('|');

      const url = [
        'https://maps.googleapis.com/maps/api/directions/json',
        `?origin=${origin}`,
        `&destination=${destination}`,
        waypoints ? `&waypoints=optimize:false|${waypoints}` : '',
        `&mode=driving`,
        `&key=${GOOGLE_MAPS_API_KEY}`,
      ].join('');

      const res = await fetch(url);
      const data = await res.json();

      if (data.status === 'OK') {
        const encoded = data.routes[0].overview_polyline.points;
        setRouteCoords(decodePolyline(encoded));
      } else {
        Alert.alert('Google Maps', `No se pudo trazar la ruta: ${data.status}`);
      }
    } catch {
      Alert.alert('Error', 'No se pudo obtener la ruta de Google Maps.');
    } finally {
      setLoadingRoute(false);
    }
  }

  function ajustarMapa() {
    if (!mapRef.current || stops.length === 0) return;
    const coords = stops.map(s => ({ latitude: s.pdv.lat, longitude: s.pdv.lng }));
    if (userLocation) coords.push(userLocation);
    mapRef.current.fitToCoordinates(coords, {
      edgePadding: { top: 60, right: 40, bottom: 60, left: 40 },
      animated: true,
    });
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btnBack}>
          <Text style={styles.btnBackText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mapa de Ruta</Text>
        <TouchableOpacity onPress={ajustarMapa} style={styles.btnFit}>
          <Text style={styles.btnFitText}>Ajustar</Text>
        </TouchableOpacity>
      </View>

      <MapView
        ref={mapRef}
        style={styles.map}
        provider={mapProvider}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {/* Marcadores de PDVs */}
        {stops.map(stop => (
          <Marker
            key={stop.id}
            coordinate={{ latitude: stop.pdv.lat, longitude: stop.pdv.lng }}
            title={`#${stop.stop_order} · ${stop.pdv.code}`}
            description={`${stop.pdv.market_name} · ${stop.pdv.visit_minutes_estimated} min`}
            pinColor={MARKER_COLORS[stop.status] ?? 'gray'}
          />
        ))}

        {/* Polyline de ruta Google Maps */}
        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor={colors.surfaceTint}
            strokeWidth={4}
          />
        )}

        {/* Línea de marcadores directa si no hay Google Maps key */}
        {routeCoords.length === 0 && stops.length > 1 && (
          <Polyline
            coordinates={[...stops]
              .sort((a, b) => a.stop_order - b.stop_order)
              .map(s => ({ latitude: s.pdv.lat, longitude: s.pdv.lng }))}
            strokeColor={colors.outlineVariant}
            strokeWidth={2}
            lineDashPattern={[8, 4]}
          />
        )}
      </MapView>

      {/* Leyenda */}
      <View style={styles.legend}>
        {loadingRoute && (
          <View style={styles.legendRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.legendText}> Cargando ruta Google Maps...</Text>
          </View>
        )}
        {!GOOGLE_MAPS_API_KEY && (
          <Text style={styles.legendWarning}>
            ⚠ Configura GOOGLE_MAPS_API_KEY para ver la ruta real
          </Text>
        )}
        <View style={styles.legendRow}>
          {Object.entries(MARKER_COLORS).map(([status, color]) => (
            <View key={status} style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: color }]} />
              <Text style={styles.legendText}>{status}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.primary, paddingHorizontal: 16, paddingTop: 48, paddingBottom: 14,
  },
  headerTitle: { fontFamily: 'HankenGrotesk_700Bold', fontSize: 17, color: colors.white },
  btnBack: { padding: 4 },
  btnBackText: { fontFamily: 'HankenGrotesk_600SemiBold', color: colors.inversePrimary, fontSize: 15 },
  btnFit: { backgroundColor: colors.surfaceTint, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6 },
  btnFitText: { fontFamily: 'HankenGrotesk_600SemiBold', color: colors.white, fontSize: 13 },
  map: { flex: 1 },
  legend: {
    backgroundColor: colors.white, padding: 12,
    borderTopWidth: 1, borderTopColor: colors.outlineVariant,
    gap: 6,
  },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, alignItems: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontFamily: 'HankenGrotesk_400Regular', fontSize: 12, color: colors.onSurfaceVariant },
  legendWarning: { fontFamily: 'HankenGrotesk_400Regular', fontSize: 12, color: colors.error },
});
