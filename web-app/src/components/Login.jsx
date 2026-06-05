import React, { useState } from 'react';
import { BACKEND_URL } from '../lib/supabase';
import './Login.css';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, device_id: 'web-supervisor-01' }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || 'Credenciales incorrectas');
        return;
      }

      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      onLogin(data.access);
    } catch {
      setError('No se puede conectar al servidor. Verifica que el backend esté corriendo en ' + BACKEND_URL);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="brand-header">
          <img src="/logo.svg" alt="Logo Venado Route AI" className="brand-logo" />
          <div className="wordmark">
            <span className="wordmark-top">INDUSTRIAS</span>
            <span className="wordmark-bottom">VENADO</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <h2 className="form-title">ACCESO LOGÍSTICA PRO</h2>

          {error && <p style={{ color: '#c0392b', fontSize: '0.85rem', marginBottom: '12px' }}>{error}</p>}

          <div className="input-group">
            <input
              type="text"
              placeholder="Usuario (Ej. supervisor1)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'AUTENTICANDO...' : 'INICIAR SESIÓN'}
          </button>
        </form>
      </div>
    </div>
  );
}
