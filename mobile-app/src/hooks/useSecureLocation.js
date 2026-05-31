import * as Location from 'expo-location';
import * as Battery from 'expo-battery';

const VELOCIDAD_MAXIMA_MS = 41.67; // 150 km/h en m/s

export async function getSecureLocation() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Se requiere permiso de ubicación para realizar el check-in.');
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Highest,
  });

  const { latitude, longitude, speed, mocked } = position.coords;

  // Antispoofing: app de fake GPS detectada
  if (mocked === true) {
    throw new Error('MOCK_LOCATION');
  }

  // Antispoofing: velocidad físicamente imposible
  const velocidad_ms = speed ?? 0;
  if (velocidad_ms > VELOCIDAD_MAXIMA_MS) {
    throw new Error('VELOCIDAD_IMPOSIBLE');
  }

  const batteryLevel = await Battery.getBatteryLevelAsync();

  return {
    latitud: latitude,
    longitud: longitude,
    velocidad_kmh: parseFloat((velocidad_ms * 3.6).toFixed(1)),
    es_mock_location: false,
    bateria_porcentaje: Math.round(batteryLevel * 100),
  };
}

// Versión liviana para el mapa (Balanced = menor consumo de batería)
export async function getMapLocation() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') return null;

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
}
