import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, setClientAuthToken, getClientAuthToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const existing = getClientAuthToken();
    if (existing !== null) return existing;
    // Default active session for instant exploration
    const defaultToken = 'sih_jwt_session_planner_balaghat';
    setClientAuthToken(defaultToken);
    return defaultToken;
  });
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('moil_user_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallthrough
      }
    }
    return {
      username: 'a.sharma',
      name: 'Dr. A. Sharma',
      role: 'Sr. Mine Planner',
      division: 'Directorate of Mine Planning & Geosciences',
      designation: 'Sr. Mine Planner',
      badgeId: 'MOIL-EMP-4481',
      clearance: 'DGMS / UNFC Level-4'
    };
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      setClientAuthToken(token);
    }
  }, [token]);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const data = await apiLogin(username, password);
      setToken(data.access_token);
      setClientAuthToken(data.access_token);

      const profile = data.user || {
        username: username || 'a.sharma',
        name: 'Dr. A. Sharma',
        role: 'Sr. Mine Planner',
        division: 'Directorate of Mine Planning & Geosciences',
        designation: 'Sr. Mine Planner',
        badgeId: 'MOIL-EMP-4481',
        clearance: 'DGMS / UNFC Level-4'
      };
      setUser(profile);
      localStorage.setItem('moil_user_profile', JSON.stringify(profile));
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setClientAuthToken(null);
    localStorage.removeItem('moil_user_profile');
    localStorage.removeItem('moil_auth_token');
  };

  const value = {
    token,
    user,
    isAuthenticated: !!token,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
