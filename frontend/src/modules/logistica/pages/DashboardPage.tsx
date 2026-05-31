import React from 'react';
import { MapaCalor } from '../components/MapaCalor';
import { PanelSpaceShare } from '../components/PanelSpaceShare';
import { PanelCorrelacion } from '../components/PanelCorrelacion';
import { TablaDecisiones } from '../components/TablaDecisiones';
import { useDashboardStore } from '../store/useDashboardStore';

const DashboardPage: React.FC = () => {
  const { sucursalSeleccionada } = useDashboardStore();

  return (
    <div className="pb-8">
      {/* Header del Dashboard */}
      <div className="mb-6 flex-shrink-0">
        <h2 className="text-2xl font-bold text-[#003366]">Dashboard Analítico</h2>
        <p className="text-gray-500">Mapeo de calor, ejecución en punto de venta y correlación operativa.</p>
      </div>

      {/* Grid Principal (Mapa y Paneles) - Altura fija para la parte superior */}
      <div className="flex flex-col lg:flex-row gap-6 h-[500px]">
        
        {/* Área del Mapa (70% en pantallas grandes) */}
        <div className="flex-[2] h-full rounded-xl overflow-hidden shadow-sm relative z-0">
          <MapaCalor />
        </div>

        {/* Área de Paneles Laterales (30%) */}
        <div className="flex-1 h-full flex flex-col gap-4">
          {sucursalSeleccionada ? (
            <PanelCorrelacion />
          ) : (
            <PanelSpaceShare />
          )}
        </div>

      </div>

      {/* Matriz Inferior de Toma de Decisiones */}
      <TablaDecisiones />
      
    </div>
  );
};

export default DashboardPage;
