import { createContext, useContext, useState, useEffect } from 'react';

const SuperAdminContext = createContext(null);

export function SuperAdminProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('sa_token') || null);
  const [admin, setAdmin] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sa_admin') || 'null'); } catch { return null; }
  });

  const login = (tok, adminData) => {
    setToken(tok);
    setAdmin(adminData);
    localStorage.setItem('sa_token', tok);
    localStorage.setItem('sa_admin', JSON.stringify(adminData));
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem('sa_token');
    localStorage.removeItem('sa_admin');
  };

  return (
    <SuperAdminContext.Provider value={{ token, admin, login, logout, isLoggedIn: !!token }}>
      {children}
    </SuperAdminContext.Provider>
  );
}

export function useSuperAdmin() {
  const ctx = useContext(SuperAdminContext);
  if (!ctx) throw new Error('useSuperAdmin must be used inside SuperAdminProvider');
  return ctx;
}
