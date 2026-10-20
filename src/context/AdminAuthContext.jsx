import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import {
  adminLogin as apiAdminLogin,
  getAdminProfile,
  getAdminToken,
  getStoredAdmin,
  clearAdminAuth,
  setAdminAuth,
} from '../services/adminApi';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [token, setToken] = useState(() => getAdminToken());
  const [admin, setAdmin] = useState(() => getStoredAdmin());
  const [isLoading, setIsLoading] = useState(true);

  // Validate existing token on mount
  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      const currentToken = getAdminToken();
      if (!currentToken) {
        if (isMounted) {
          setAdmin(null);
          setToken(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const profile = await getAdminProfile();
        if (isMounted) {
          setAdmin(profile);
          setToken(currentToken);
        }
      } catch (err) {
        console.warn('[AdminAuth] Token verification failed:', err.message);
        clearAdminAuth();
        if (isMounted) {
          setAdmin(null);
          setToken(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      const result = await apiAdminLogin(email, password);
      setToken(result.token);
      setAdmin(result.admin);
      setAdminAuth(result.token, result.admin);
      return { success: true, admin: result.admin };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Invalid admin credentials',
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearAdminAuth();
    setToken(null);
    setAdmin(null);
  }, []);

  const value = {
    admin,
    token,
    isAuthenticated: !!token && !!admin,
    isLoading,
    login,
    logout,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}

/**
 * Protected Route Wrapper for Admin Pages
 */
export function AdminProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="relative flex items-center justify-center">
          <div className="w-14 h-14 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
          <span className="absolute text-xl">🐾</span>
        </div>
        <p className="mt-4 text-sm font-medium text-slate-400">
          Verifying Admin Access...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}
