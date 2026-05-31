import React, { useState } from 'react';
import { MapContainer, TileLayer, Polyline, Circle, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Truck, AlertTriangle, CheckCircle2, Navigation } from 'lucide-react';

// Coordenadas simuladas en La Paz
const BASE = [-16.4950, -68.1300] as [number, number];
const DESTINO_1 = [-16.5367, -68.0924] as [number, number]; // Ketal Megacenter
const VEHICULO_ACTUAL = [-16.5150, -68.1100] as [number, number]; // A medio camino

// Ruta planificada
const RUTA_PLANIFICADA: [number, number][] = [
  BASE,
  [-16.5050, -68.1200],
  [-16.5100, -68.1150],
  VEHICULO_ACTUAL,
  [-16.5200, -68.1050],
  [-16.5300, -68.1000],
  DESTINO_1
];

export const RutasMapaPage: React.FC = () => {
  const [selectedTruck, setSelectedTruck] = useState(1);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-4 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-[#003366]">Seguimiento de Flota (Geofencing)</h2>
          <p className="text-gray-500">Monitoreo en tiempo real de rutas y cruce de geocercas.</p>
        </div>
        <div className="flex gap-2">
          <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            GPS Activo
          </span>
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        
        {/* Panel Lateral de Flota */}
        <div className="w-80 bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col gap-3 overflow-y-auto">
          <h3 className="font-bold text-gray-700 uppercase text-xs tracking-wider mb-2">Unidades Activas</h3>
          
          {/* Tarjeta Camión 1 */}
          <div 
            onClick={() => setSelectedTruck(1)}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedTruck === 1 ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 hover:border-blue-300'}`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className="bg-[#003366] p-1.5 rounded-md">
                  <Truck className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Camión VEN-01</h4>
                  <p className="text-xs text-gray-500">Ruta Sur (Irpavi)</p>
                </div>
              </div>
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <p className="flex justify-between"><span>Velocidad:</span> <span className="font-medium">45 km/h</span></p>
              <p className="flex justify-between"><span>Estado:</span> <span className="font-medium text-green-600">En Ruta (A tiempo)</span></p>
            </div>
          </div>

          {/* Tarjeta Camión 2 (Con Alerta) */}
          <div 
            onClick={() => setSelectedTruck(2)}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedTruck === 2 ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 hover:border-blue-300'}`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className="bg-[#D32F2F] p-1.5 rounded-md">
                  <Truck className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Camión VEN-04</h4>
                  <p className="text-xs text-gray-500">Ruta Centro</p>
                </div>
              </div>
              <AlertTriangle className="w-5 h-5 text-[#D32F2F] animate-pulse" />
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <p className="flex justify-between"><span>Velocidad:</span> <span className="font-medium">0 km/h</span></p>
              <p className="flex justify-between"><span>Estado:</span> <span className="font-medium text-[#D32F2F]">Desvío de Geocerca (150m)</span></p>
            </div>
          </div>
        </div>

        {/* Mapa de Tracking */}
        <div className="flex-1 rounded-xl overflow-hidden shadow-sm border border-gray-200 relative z-0">
          <MapContainer 
            center={VEHICULO_ACTUAL} 
            zoom={14} 
            className="h-full w-full"
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            
            {/* Geocerca Base (Almacén) */}
            <Circle 
              center={BASE} 
              radius={100} 
              pathOptions={{ color: '#003366', fillColor: '#003366', fillOpacity: 0.2 }} 
            >
              <Popup>Almacén Central (Geocerca 100m)</Popup>
            </Circle>

            {/* Geocerca Destino */}
            <Circle 
              center={DESTINO_1} 
              radius={100} 
              pathOptions={{ color: '#5E7032', fillColor: '#5E7032', fillOpacity: 0.2 }} 
            >
              <Popup>Ketal Megacenter (Geocerca 100m)</Popup>
            </Circle>

            {/* Ruta Planificada */}
            <Polyline 
              positions={RUTA_PLANIFICADA} 
              pathOptions={{ color: '#003366', weight: 4, dashArray: '10, 10' }} 
            />

            {/* Vehículo en movimiento */}
            <CircleMarker
              center={VEHICULO_ACTUAL}
              radius={12}
              pathOptions={{
                color: '#fff',
                fillColor: '#003366',
                fillOpacity: 1,
                weight: 3
              }}
            >
              <Popup>
                <div className="font-sans text-center">
                  <Truck className="w-6 h-6 mx-auto mb-1 text-[#003366]" />
                  <h3 className="font-bold text-gray-900 text-sm">VEN-01</h3>
                  <p className="text-xs text-gray-500">45 km/h</p>
                </div>
              </Popup>
            </CircleMarker>

          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default RutasMapaPage;
