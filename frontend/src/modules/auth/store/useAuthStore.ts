import { create } from 'zustand';

const DEVICE_ID = 'web-supervisor-01';

export interface AuthUser {
  username: string;
  role: string;
  firstName: string;
}

interface AuthStore {
  isAuthenticated: boolean;
  token: string | null;
  user: AuthUser | null;
  deviceId: string;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  getAuthHeaders: () => Record<string, string>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  isAuthenticated: !!localStorage.getItem('access_token'),
  token: localStorage.getItem('access_token'),
  user: JSON.parse(localStorage.getItem('auth_user') || 'null'),
  deviceId: DEVICE_ID,

  login: (token, user) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
    set({ isAuthenticated: true, token, user });
  },

  logout: () => {
    ['access_token', 'refresh_token', 'auth_user'].forEach((k) =>
      localStorage.removeItem(k)
    );
    set({ isAuthenticated: false, token: null, user: null });
  },

  getAuthHeaders: () => ({
    Authorization: `Bearer ${get().token ?? ''}`,
    'X-Device-ID': DEVICE_ID,
    'Content-Type': 'application/json',
  }),
}));
