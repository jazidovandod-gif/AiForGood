import React, { useEffect, useState } from 'react';
import { BACKEND_URL, supabase } from '../lib/supabase';

export default function Dashboard({ token, onLogout }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [source, setSource] = useState('');

  useEffect(() => {
    cargarDashboard();
  }, []);

  async function cargarDashboard() {
    // Intenta Supabase directo si está configurado
    if (supabase) {
      try {
        const { data: rows, error: sbErr } = await supabase
          .from('vw_supervisor_dashboard')
          .select('*');

        if (!sbErr && rows && rows.length > 0) {
          setData({ fecha: new Date().toISOString().split('T')[0], rutas: rows });
          setSource('Supabase');
          return;
        }
      } catch {}
    }

    // Fallback: backend Django
    try {
      const res = await fetch(`${BACKEND_URL}/api/logistica/supervisor/dashboard/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Device-ID': 'web-supervisor-01',
        },
      });

      if (res.status === 401) {
        onLogout();
        return;
      }

      if (!res.ok) {
        setError('Error al cargar dashboard: ' + res.status);
        return;
      }

      setData(await res.json());
      setSource('Backend Django');
    } catch (e) {
      setError('Sin conexión al servidor: ' + e.message);
    }
  }

  if (error) return (
    <div style={{ padding: 24, color: '#c0392b' }}>
      <strong>Error:</strong> {error}
    </div>
  );

  if (!data) return <div style={{ padding: 24 }}>Cargando dashboard...</div>;

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#1a237e' }}>Panel Supervisor — Venado</h1>
          <small style={{ color: '#666' }}>Fecha: {data.fecha} · Fuente: <strong>{source}</strong></small>
        </div>
        <button onClick={onLogout} style={{ padding: '6px 16px', cursor: 'pointer' }}>Salir</button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
        <thead>
          <tr style={{ background: '#1a237e', color: '#fff' }}>
            <th style={th}>Reponedor</th>
            <th style={th}>Estado</th>
            <th style={th}>PDVs</th>
            <th style={th}>Completados</th>
            <th style={th}>Pendientes</th>
            <th style={th}>Omitidos</th>
            <th style={th}>% Avance</th>
            <th style={th}>Min estimados</th>
          </tr>
        </thead>
        <tbody>
          {data.rutas.map((r, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? '#f5f5f5' : '#fff' }}>
              <td style={td}>{r.reponedor || r.replenisher_name}</td>
              <td style={td}><StatusBadge status={r.status || r.route_status} /></td>
              <td style={{ ...td, textAlign: 'center' }}>{r.total_pdvs}</td>
              <td style={{ ...td, textAlign: 'center', color: '#2e7d32', fontWeight: 'bold' }}>{r.completados ?? r.stops_completed}</td>
              <td style={{ ...td, textAlign: 'center' }}>{r.pendientes ?? r.stops_pending}</td>
              <td style={{ ...td, textAlign: 'center', color: '#c62828' }}>{r.omitidos ?? r.stops_skipped}</td>
              <td style={{ ...td, textAlign: 'center' }}>
                <strong>{r.pct_completitud ?? r.completion_pct ?? 0}%</strong>
              </td>
              <td style={{ ...td, textAlign: 'center' }}>{r.total_estimado_min ?? r.total_estimated_minutes}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {data.rutas.length === 0 && (
        <p style={{ color: '#666', textAlign: 'center', marginTop: 32 }}>Sin rutas activas para hoy.</p>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    pending: '#f57f17',
    in_progress: '#1565c0',
    completed: '#2e7d32',
    partial: '#6a1b9a',
  };
  return (
    <span style={{
      background: colors[status] || '#666',
      color: '#fff',
      padding: '2px 8px',
      borderRadius: 4,
      fontSize: '0.8rem',
    }}>
      {status}
    </span>
  );
}

const th = { padding: '10px 12px', textAlign: 'left', fontWeight: 600 };
const td = { padding: '10px 12px', borderBottom: '1px solid #e0e0e0' };
