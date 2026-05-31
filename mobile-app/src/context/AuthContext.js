import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

const DEVICE_ID_KEY = '@venado_device_id';
const TOKEN_KEY = '@venado_token';

function generateDeviceId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        let [storedToken, storedDeviceId] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(DEVICE_ID_KEY),
        ]);

        if (!storedDeviceId) {
          storedDeviceId = generateDeviceId();
          await AsyncStorage.setItem(DEVICE_ID_KEY, storedDeviceId);
        }

        setDeviceId(storedDeviceId);
        setToken(storedToken);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  async function login(newToken) {
    await AsyncStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
  }

  async function logout() {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }

  return (
    <AuthContext.Provider value={{ token, deviceId, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
