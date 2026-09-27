import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('student_perf_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('student_perf_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyStoredAuth = async () => {
      if (token) {
        try {
          const response = await authService.getMe();
          setUser(response.data);
          localStorage.setItem('student_perf_user', JSON.stringify(response.data));
        } catch (err) {
          console.warn('Session expired or invalid token:', err);
          logout();
        }
      }
      setLoading(false);
    };

    verifyStoredAuth();
  }, [token]);

  const login = async (email, password) => {
    const response = await authService.login({ email, password });
    const { access_token, user: userData } = response.data;

    setToken(access_token);
    setUser(userData);
    localStorage.setItem('student_perf_token', access_token);
    localStorage.setItem('student_perf_user', JSON.stringify(userData));

    return userData;
  };

  const register = async (email, password, role = 'student') => {
    const response = await authService.register({ email, password, role });
    const { access_token, user: userData } = response.data;

    setToken(access_token);
    setUser(userData);
    localStorage.setItem('student_perf_token', access_token);
    localStorage.setItem('student_perf_user', JSON.stringify(userData));

    return userData;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('student_perf_token');
    localStorage.removeItem('student_perf_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
