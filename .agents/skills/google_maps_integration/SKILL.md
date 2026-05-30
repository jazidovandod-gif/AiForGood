---
name: google-maps-integration
description: Guía de integración de Google Maps Platform (Maps, Routes, Distance Matrix) para el proyecto Industrias Venado usando React y Vite.
---

# Integración de Google Maps Platform

Esta skill define los estándares y pasos para implementar Google Maps en el Frontend del proyecto "Industrias Venado".

## 1. Stack Tecnológico Elegido
- **Frontend Framework:** React 18+ (con Vite)
- **Librería de Mapas:** `@vis.gl/react-google-maps` (Oficial de Google, moderna, basada en Hooks).
- **APIs de Google a habilitar en la Consola de GCP:**
  1. Maps JavaScript API (Para mostrar el mapa).
  2. Directions API (Para calcular y dibujar rutas).
  3. Distance Matrix API (Para cálculos de tiempo real).
  4. Places API (Opcional, si se necesita autocompletado de búsqueda).

## 2. Variables de Entorno y Seguridad
- La API Key debe restringirse en Google Cloud Console a los dominios autorizados (ej. `localhost:5173` para desarrollo y el dominio final de producción).
- En el proyecto Vite, la clave debe guardarse en el archivo `.env` como:
  ```env
  VITE_GOOGLE_MAPS_API_KEY=AIzaSy...
  ```
- **NUNCA** hacer commit del archivo `.env` al repositorio.

## 3. Patrón de Implementación (React)

### Inicialización del Mapa
Toda la aplicación o la vista del mapa debe estar envuelta en el `APIProvider` proporcionado por la librería oficial.

```tsx
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

export const RouteMap = () => {
  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <Map
        defaultZoom={14}
        defaultCenter={{ lat: -16.5000, lng: -68.1193 }} // La Paz, Bolivia
        mapId="DEMO_MAP_ID" // Necesario para Advanced Markers
      >
        {/* Aquí irán los marcadores de los PDVs */}
      </Map>
    </APIProvider>
  );
};
```

### Marcadores (PDVs)
Debemos usar `AdvancedMarker` en lugar del Marker clásico, ya que permite personalización avanzada (colores por estado: pendiente, completado, etc.).

```tsx
<AdvancedMarker position={{lat: pdv.latitude, lng: pdv.longitude}}>
  <Pin background={'#FF0000'} borderColor={'#000'} glyphColor={'#FFF'} />
</AdvancedMarker>
```

## 4. Lógica de Enrutamiento (Directions)
Para dibujar la ruta entre múltiples Puntos de Venta (PDVs):

1. **Uso de Hooks:** Crear un custom hook `useDirections` que instancie `google.maps.DirectionsService` y `google.maps.DirectionsRenderer`.
2. **Waypoints:** El punto inicial será la ubicación del reponedor, el destino será el último PDV, y los PDVs intermedios se pasarán como `waypoints`.
3. **Optimización:** Si bien nuestro backend genera un orden con `Nearest Neighbor`, podemos usar `optimizeWaypoints: true` en la petición de Google para que Google aplique su propia inteligencia de tráfico y re-ordene la ruta si hay bloqueos en La Paz.

Ejemplo de llamada al servicio:
```javascript
directionsService.route({
  origin: currentPosition,
  destination: lastPdv,
  waypoints: intermediatePdvs.map(pdv => ({ location: {lat: pdv.lat, lng: pdv.lng} })),
  travelMode: google.maps.TravelMode.DRIVING,
  optimizeWaypoints: false // (O true si queremos sobreescribir el orden del backend)
}, (response, status) => {
  if (status === 'OK') {
    directionsRenderer.setDirections(response);
  }
});
```

## 5. Casos de Uso del Hackathon
- **Supervisor Dashboard:** Ver todos los reponedores en vivo.
- **Replenisher App:** Ver su ruta diaria, hacer clic en un PDV para iniciar la navegación ("Deep Link" a la app nativa de Waze/Google Maps).

## 6. Deep Linking a Navegación Nativa
Para que el reponedor conduzca sin distracciones, al darle "Ir al PDV", abriremos Google Maps nativo en su celular:
```javascript
const url = `https://www.google.com/maps/dir/?api=1&destination=${pdv.lat},${pdv.lng}&travelmode=driving`;
window.open(url, '_blank');
```
