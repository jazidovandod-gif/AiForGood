import { useAuth } from '../context/AuthContext';
import { BACKEND_URL } from '../constants/api';

export function useApi() {
  const { token, deviceId, logout } = useAuth();

  async function apiFetch(path, options = {}) {
    const { headers: extraHeaders, ...rest } = options;

    const res = await fetch(`${BACKEND_URL}${path}`, {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'X-Device-ID': deviceId,
        ...extraHeaders,
      },
    });

    if (res.status === 401) {
      logout();
      throw new Error('Sesión expirada');
    }

    return res;
  }

  return { apiFetch };
}
