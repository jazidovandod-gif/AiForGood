import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useDashboardStore } from '../store/useDashboardStore';

const FlyToMarker = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
};

export const MapaCalor: React.FC = () => {
  const { sucursales, sucursalSeleccionada, setSucursalSeleccionada } = useDashboardStore();
  
  // Centro de La Paz, Bolivia
  const defaultCenter: [number, number] = [-16.4996, -68.1350];

  return (
    <div className="h-full w-full rounded-xl overflow-hidden shadow-sm border border-gray-200 relative z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={13} 
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        
        {sucursalSeleccionada && (
          <FlyToMarker center={[sucursalSeleccionada.lat, sucursalSeleccionada.lng]} zoom={15} />
        )}

        {sucursales.map((sucursal) => {
          const colorFill = sucursal.metaAlcanzada ? '#5E7032' : '#D32F2F';
          
          return (
            <CircleMarker
              key={sucursal.id}
              center={[sucursal.lat, sucursal.lng]}
              radius={sucursal.id === sucursalSeleccionada?.id ? 14 : 10}
              pathOptions={{
                color: colorFill,
                fillColor: colorFill,
                fillOpacity: 0.7,
                weight: sucursal.id === sucursalSeleccionada?.id ? 3 : 1
              }}
              eventHandlers={{
                click: () => setSucursalSeleccionada(sucursal)
              }}
            >
              <Popup className="font-sans">
                <div className="p-1">
                  <h3 className="font-bold text-gray-900">{sucursal.nombre}</h3>
                  <p className={`text-xs font-semibold ${sucursal.metaAlcanzada ? 'text-[#5E7032]' : 'text-[#D32F2F]'}`}>
                    {sucursal.metaAlcanzada ? 'Meta Alcanzada' : 'Zona Crítica'}
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
};
