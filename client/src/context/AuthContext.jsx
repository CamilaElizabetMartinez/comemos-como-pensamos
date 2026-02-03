import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const register = async (userData) => {
    const data = await authService.register(userData);
    setUser(data.data.user);
    return data;
  };

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    setUser(data.data.user);
    return data;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Silent fail
    } finally {
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('cart');
      // Dispatch event to notify CartContext
      window.dispatchEvent(new CustomEvent('userLogout'));
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const refreshUser = useCallback(async () => {
    try {
      const response = await api.get('/users/profile');
      if (response.data.success) {
        const updatedUser = response.data.data.user;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
    return null;
  }, []);

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    updateUser,
    refreshUser,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
