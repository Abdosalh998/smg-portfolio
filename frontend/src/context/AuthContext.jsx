import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/auth.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true); // initial auth check

  // ─── Initialize from localStorage ────────────────────────────────
  useEffect(() => {
    const storedToken = localStorage.getItem('smg_token');
    const storedUser  = localStorage.getItem('smg_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('smg_token');
        localStorage.removeItem('smg_user');
      }
    }
    setLoading(false);
  }, []);

  // ─── Login ────────────────────────────────────────────────────────
  const login = useCallback(async (identifier, password) => {
    const data = await authService.login(identifier, password);
    const { token: newToken, user: newUser } = data;

    localStorage.setItem('smg_token', newToken);
    localStorage.setItem('smg_user', JSON.stringify(newUser));

    setToken(newToken);
    setUser(newUser);
    return data;
  }, []);

  // ─── Logout ───────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await authService.logout();
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
