import React, { useEffect, useState, useCallback } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { supabase } from '../lib/supabase';
import {
  MapPin, Users, CheckCircle2, Clock, AlertTriangle,
  LogOut, Navigation, Store, Wifi, Calendar, TrendingUp
} from 'lucide-react';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Centro de La Paz, Bolivia
const LA_PAZ_CENTER = { lat: -16.5000, lng: -68.1193 };

export default function Dashboard({ token, onLogout }) {
  const [pdvs, setPdvs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPdv, setSelectedPdv] = useState(null);
  const [activePdvId, setActivePdvId] = useState(null);

  const cargarDatos = useCallback(async () => {
    if (!supabase) {
      setError('Supabase no está configurado. Verifica el archivo .env');
      setLoading(false);
      return;
    }

    try {
      // Cargar PDVs con coordenadas
      const { data: pdvData, error: pdvErr } = await supabase
        .from('pdvs')
        .select('id, name, address, channel, latitude, longitude, client_type_id');

      if (pdvErr) throw pdvErr;

      // Cargar usuarios reponedores
      const { data: userData, error: userErr } = await supabase
        .from('users')
        .select('id, full_name, role, phone')
        .eq('role', 'replenisher');

      if (userErr) throw userErr;

      // Cargar visitas de hoy
      const today = new Date().toISOString().split('T')[0];
      const { data: visitData } = await supabase
        .from('visits')
        .select('id, pdv_id, status, started_at, finished_at')
        .eq('visit_date', today);

      // Mapear estado de visita a cada PDV
      const visitMap = {};
      (visitData || []).forEach(v => {
        visitMap[v.pdv_id] = v.status;
      });

      const enrichedPdvs = (pdvData || []).map(pdv => ({
        ...pdv,
        visitStatus: visitMap[pdv.id] || 'pending'
      }));

      setPdvs(enrichedPdvs);
      setUsers(userData || []);
      setLoading(false);
    } catch (e) {
      setError('Error al cargar datos: ' + e.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Estadísticas
  const totalPdvs = pdvs.length;
  const completados = pdvs.filter(p => p.visitStatus === 'completed').length;
  const pendientes = pdvs.filter(p => p.visitStatus === 'pending').length;
  const enProgreso = pdvs.filter(p => p.visitStatus === 'in_progress').length;

  const handlePdvClick = (pdv) => {
    setActivePdvId(pdv.id);
    setSelectedPdv(pdv);
  };

  const getMarkerColors = (status) => {
    switch (status) {
      case 'completed':
        return { bg: '#1B6D24', border: '#0a4a12', glyph: '#FFFFFF' };
      case 'in_progress':
        return { bg: '#3A5F94', border: '#001E40', glyph: '#FFFFFF' };
      case 'skipped':
        return { bg: '#BA1A1A', border: '#460003', glyph: '#FFFFFF' };
      default:
        return { bg: '#A7C8FF', border: '#3A5F94', glyph: '#001E40' };
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'in_progress': return 'En progreso';
      case 'skipped': return 'Omitido';
      default: return 'Pendiente';
    }
  };

  // ── Loading State ──
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <span className="loading-text">Cargando panel de control</span>
      </div>
    );
  }

  // ── Error State ──
  if (error) {
    return (
      <div className="error-screen">
        <AlertTriangle size={48} />
        <p>{error}</p>
      </div>
    );
  }

  const today = new Date();
  const dateStr = today.toLocaleDateString('es-BO', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div className="dashboard-layout">
      {/* ── TOP BAR ── */}
      <header className="topbar">
        <div className="topbar-brand">
          <Navigation size={22} />
          <h1>Logistica Pro — Venado</h1>
        </div>
        <div className="topbar-meta">
          <span className="topbar-badge online">
            <Wifi size={12} /> Conectado
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={14} />
            {dateStr}
          </span>
          <button className="btn-logout" onClick={onLogout}>
            <LogOut size={14} /> Salir
          </button>
        </div>
      </header>

      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Panel de Control</h2>
          <p>{users.length} reponedores · {totalPdvs} puntos de venta</p>
        </div>

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-value primary">{totalPdvs}</span>
            <span className="stat-label">Total PDVs</span>
          </div>
          <div className="stat-card">
            <span className="stat-value success">{completados}</span>
            <span className="stat-label">Completados</span>
          </div>
          <div className="stat-card">
            <span className="stat-value warning">{pendientes + enProgreso}</span>
            <span className="stat-label">Pendientes</span>
          </div>
        </div>

        {/* PDV List */}
        <div className="pdv-list">
          {pdvs.map((pdv) => (
            <div
              key={pdv.id}
              className={`pdv-card ${activePdvId === pdv.id ? 'active' : ''}`}
              onClick={() => handlePdvClick(pdv)}
            >
              <div className={`pdv-accent ${pdv.visitStatus}`}></div>
              <div className="pdv-content">
                <div className="pdv-name">{pdv.name}</div>
                <div className="pdv-meta">
                  <span className={`pdv-badge ${pdv.visitStatus}`}>
                    {pdv.visitStatus === 'completed' && <CheckCircle2 size={10} />}
                    {pdv.visitStatus === 'pending' && <Clock size={10} />}
                    {pdv.visitStatus === 'skipped' && <AlertTriangle size={10} />}
                    {getStatusLabel(pdv.visitStatus)}
                  </span>
                  <span>{pdv.channel || 'Canal'}</span>
                </div>
              </div>
            </div>
          ))}

          {pdvs.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--on-surface-variant)' }}>
              <Store size={40} strokeWidth={1.2} style={{ marginBottom: 12, opacity: 0.4 }} />
              <p style={{ fontSize: 14 }}>Sin puntos de venta registrados</p>
            </div>
          )}
        </div>
      </aside>

      {/* ── MAP ── */}
      <div className="map-container">
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
          <Map
            defaultZoom={13}
            defaultCenter={LA_PAZ_CENTER}
            mapId="venado-dashboard-map"
            gestureHandling="greedy"
            disableDefaultUI={false}
            style={{ width: '100%', height: '100%' }}
          >
            {pdvs.map((pdv) => {
              if (!pdv.latitude || !pdv.longitude) return null;
              const colors = getMarkerColors(pdv.visitStatus);
              return (
                <AdvancedMarker
                  key={pdv.id}
                  position={{ lat: parseFloat(pdv.latitude), lng: parseFloat(pdv.longitude) }}
                  onClick={() => handlePdvClick(pdv)}
                >
                  <Pin
                    background={colors.bg}
                    borderColor={colors.border}
                    glyphColor={colors.glyph}
                    scale={activePdvId === pdv.id ? 1.3 : 1}
                  />
                </AdvancedMarker>
              );
            })}

            {selectedPdv && selectedPdv.latitude && selectedPdv.longitude && (
              <InfoWindow
                position={{
                  lat: parseFloat(selectedPdv.latitude),
                  lng: parseFloat(selectedPdv.longitude)
                }}
                onCloseClick={() => { setSelectedPdv(null); setActivePdvId(null); }}
              >
                <div style={{ fontFamily: 'Hanken Grotesk, sans-serif', padding: '4px 0', minWidth: 200 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#001E40', marginBottom: 6 }}>
                    {selectedPdv.name}
                  </h3>
                  <p style={{ fontSize: 13, color: '#43474F', marginBottom: 4 }}>
                    <MapPin size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                    {selectedPdv.address || 'Sin dirección registrada'}
                  </p>
                  <p style={{ fontSize: 13, color: '#43474F', marginBottom: 8 }}>
                    Canal: <strong>{selectedPdv.channel || '—'}</strong>
                  </p>
                  <span
                    className={`pdv-badge ${selectedPdv.visitStatus}`}
                    style={{ fontSize: 12 }}
                  >
                    {selectedPdv.visitStatus === 'completed' && <CheckCircle2 size={10} />}
                    {selectedPdv.visitStatus === 'pending' && <Clock size={10} />}
                    {getStatusLabel(selectedPdv.visitStatus)}
                  </span>
                  <div style={{ marginTop: 10 }}>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPdv.latitude},${selectedPdv.longitude}&travelmode=driving`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '6px 14px', borderRadius: 4,
                        background: '#001E40', color: '#fff',
                        fontSize: 12, fontWeight: 600, textDecoration: 'none',
                        letterSpacing: '0.05em', textTransform: 'uppercase'
                      }}
                    >
                      <Navigation size={12} /> Navegar
                    </a>
                  </div>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>

        {/* Map Legend Overlay */}
        <div className="map-overlay">
          <div className="map-legend">
            <div className="legend-item">
              <div className="legend-dot pending"></div>
              Pendiente
            </div>
            <div className="legend-item">
              <div className="legend-dot completed"></div>
              Completado
            </div>
            <div className="legend-item">
              <div className="legend-dot skipped"></div>
              Omitido
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
