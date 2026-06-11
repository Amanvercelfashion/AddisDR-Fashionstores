/**
 * AdminAuthContext — stores the business admin login session.
 * Keyed by business_id so multiple businesses can be managed in the same browser.
 */
import { createContext, useContext, useState } from 'react';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  // sessions = { [businessId]: { business, loggedIn: true } }
  const [sessions, setSessions] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('admin_sessions') || '{}');
    } catch { return {}; }
  });

  const login = (businessId, business) => {
    const updated = { ...sessions, [businessId]: { business, loggedIn: true } };
    setSessions(updated);
    sessionStorage.setItem('admin_sessions', JSON.stringify(updated));
  };

  const logout = (businessId) => {
    const updated = { ...sessions };
    delete updated[businessId];
    setSessions(updated);
    sessionStorage.setItem('admin_sessions', JSON.stringify(updated));
  };

  const isLoggedIn = (businessId) => !!sessions[businessId]?.loggedIn;

  return (
    <AdminAuthContext.Provider value={{ sessions, login, logout, isLoggedIn }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used inside AdminAuthProvider');
  return ctx;
}
