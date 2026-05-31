import { create } from 'zustand';

interface AuthStore {
  isAuthenticated: boolean;
  token: string | null;
  user: { username: string; role: string; firstName: string } | null;
  login: (token: string, user: { username: string; role: string; firstName: string }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: !!localStorage.getItem('access_token'),
  token: localStorage.getItem('access_token'),
  user: JSON.parse(localStorage.getItem('auth_user') || 'null'),
  login: (token, user) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
    set({ isAuthenticated: true, token, user });
  },
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('auth_user');
    set({ isAuthenticated: false, token: null, user: null });
  }
}));
