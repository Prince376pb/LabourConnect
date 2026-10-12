import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { ROLES } from '../utils/constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data) {
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
          }
        } catch (err) {
          console.error("Session verification failed", err);
          logout();
        }
      }
      setLoading(false);
    };

    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data && res.data.accessToken) {
      const { accessToken, user: userData } = res.data;
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(accessToken);
      setUser(userData);
      return userData;
    }
    throw new Error('Invalid login response');
  };

  const register = async (registerData) => {
    const res = await api.post('/auth/register', registerData);
    if (res.data && res.data.accessToken) {
      const { accessToken, user: userData } = res.data;
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(accessToken);
      setUser(userData);
      return userData;
    }
    throw new Error('Invalid registration response');
  };

  const googleAuth = async (googleAuthData) => {
    const res = await api.post('/auth/google', googleAuthData);
    if (res.data) {
      if (res.data.needsRegistration) {
        return res.data;
      }
      if (res.data.accessToken) {
        const { accessToken, user: userData } = res.data;
        localStorage.setItem('token', accessToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(accessToken);
        setUser(userData);
        return userData;
      }
    }
    throw new Error('Invalid Google authentication response');
  };

  const logout = () => {
    try {
      api.post('/auth/logout').catch(() => {});
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    }
  };

  const hasRole = (role, targetUser = user) => {
    if (!targetUser || !targetUser.roles) return false;
    return targetUser.roles.includes(role);
  };

  const primaryRole = (targetUser = user) => {
    if (!targetUser || !targetUser.roles || targetUser.roles.length === 0) return null;
    if (hasRole(ROLES.ADMIN, targetUser)) return ROLES.ADMIN;
    if (hasRole(ROLES.EMPLOYER, targetUser)) return ROLES.EMPLOYER;
    if (hasRole(ROLES.WORKER, targetUser)) return ROLES.WORKER;
    if (hasRole(ROLES.PROVIDER, targetUser)) return ROLES.PROVIDER;
    if (hasRole(ROLES.CUSTOMER, targetUser)) return ROLES.CUSTOMER;
    return targetUser.roles[0];
  };

  const dashboardRoute = (targetUser = user) => {
    const role = primaryRole(targetUser);
    switch (role) {
      case ROLES.ADMIN: return '/admin/dashboard';
      case ROLES.EMPLOYER: return '/employer/dashboard';
      case ROLES.WORKER: return '/worker/dashboard';
      case ROLES.PROVIDER: return '/provider/dashboard';
      case ROLES.CUSTOMER: return '/customer/dashboard';
      default: return '/';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        googleAuth,
        logout,
        hasRole,
        primaryRole,
        dashboardRoute,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
