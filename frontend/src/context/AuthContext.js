import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Check for existing token on app start
  useEffect(() => {
    const checkToken = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('authToken');
        if (storedToken) setToken(storedToken);
      } catch (error) {
        console.log('Error checking token:', error);
      } finally {
        setIsLoading(false);
      }
    };
    checkToken();
  }, []);

  // 2. Fetch user whenever token changes
  useEffect(() => {
    if (token) {
      (async () => {
        try {
          const res = await api.get('/api/auth/user');
          setUser(res.data);
        } catch {
          await SecureStore.deleteItemAsync('authToken');
          setToken(null);
          setUser(null);
        }
      })();
    } else {
      setUser(null);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    const { token: newToken } = res.data;
    await SecureStore.setItemAsync('authToken', newToken);
    setToken(newToken);
  };

  const register = async (username, email, password, board, classLevel) => {
    const res = await api.post('/api/auth/register', {
      username,
      email,
      password,
      board,
      classLevel,
    });
    const { token: newToken } = res.data;
    await SecureStore.setItemAsync('authToken', newToken);
    setToken(newToken);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('authToken');
    setToken(null);
    setUser(null);
  };

  // 🔄 Refresh user data from backend (e.g., after earning XP)
  const refreshUser = async () => {
    try {
      const res = await api.get('/api/auth/user');
      setUser(res.data);
    } catch (err) {
      console.log('Failed to refresh user:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{ token, user, isLoading, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}