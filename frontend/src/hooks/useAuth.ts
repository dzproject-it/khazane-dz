import { useState, useCallback } from 'react';
import api from '../services/api';
import type { User, AuthResponse } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('khazane_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    localStorage.setItem('khazane_token', data.accessToken);
    localStorage.setItem('khazane_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('khazane_token');
    localStorage.removeItem('khazane_user');
    setUser(null);
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    login,
    logout,
  };
}
