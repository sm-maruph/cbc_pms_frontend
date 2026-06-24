// src/context/PermissionContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const PermissionContext = createContext({
  permissions: [],
  can: () => false,
  canAny: () => false,
  canAll: () => false,
  loading: true,
  refetch: () => {},
});

export const usePermissions = () => useContext(PermissionContext);

export const PermissionProvider = ({ children }) => {
  const { user, isLoggedIn } = useAuth();
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading]         = useState(true);

  const API_BASE = import.meta.env.VITE_API_URL || "http://192.168.23.17:5000/api" || "http://localhost:5000/api"; 

  const fetchPermissions = useCallback(async () => {
    const token = localStorage.getItem('cbcToken');
    if (!token || !isLoggedIn) {
      setPermissions([]);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/auth/my-permissions`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
      });
      if (!res.ok) throw new Error('Failed to fetch permissions');
      const data = await res.json();
      setPermissions(data.permissions || []);
    } catch (e) {
      console.error('PermissionContext: failed to fetch permissions', e);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, API_BASE]);

  // Re-fetch whenever the logged-in user changes
  useEffect(() => {
    setLoading(true);
    fetchPermissions();
  }, [fetchPermissions, user?.id]);

  /** Returns true if the user has the exact permission OR is Super Admin */
  const can = useCallback(
    (permission) => {
      if (!user) return false;
      if (user.role === 'Super Admin') return true;
      return permissions.includes(permission);
    },
    [permissions, user]
  );

  /** Returns true if the user has ANY of the supplied permissions */
  const canAny = useCallback(
    (...perms) => perms.some((p) => can(p)),
    [can]
  );

  /** Returns true if the user has ALL of the supplied permissions */
  const canAll = useCallback(
    (...perms) => perms.every((p) => can(p)),
    [can]
  );

  return (
    <PermissionContext.Provider
      value={{ permissions, can, canAny, canAll, loading, refetch: fetchPermissions }}
    >
      {children}
    </PermissionContext.Provider>
  );
};
