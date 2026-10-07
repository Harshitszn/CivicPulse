import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import ApiClient from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('civicpulse_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Hydrate user from backend using token on initial load
  const loadUser = useCallback(async () => {
    const token = ApiClient.getToken();
    if (!token) {
      setCurrentUser(null);
      setLoading(false);
      return;
    }

    try {
      const user = await ApiClient.getMe();
      setCurrentUser(user);
      localStorage.setItem('civicpulse_user', JSON.stringify(user));
    } catch (err) {
      console.warn('Failed to verify token:', err.message);
      ApiClient.logout();
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async ({ email, password }) => {
    setLoading(true);
    try {
      const res = await ApiClient.login({ email, password });
      const user = res.user;
      setCurrentUser(user);
      localStorage.setItem('civicpulse_user', JSON.stringify(user));
      toast.success(`Welcome back, ${user.full_name || user.name || 'User'}!`);
      return user;
    } catch (err) {
      toast.error(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await ApiClient.register(userData);
      const user = res.user;
      setCurrentUser(user);
      localStorage.setItem('civicpulse_user', JSON.stringify(user));
      toast.success('Registration successful! Welcome to CivicPulse.');
      return user;
    } catch (err) {
      toast.error(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    ApiClient.logout();
    setCurrentUser(null);
    toast.info('You have been logged out.');
  };

  const updateProfile = async (profileData) => {
    try {
      const updated = await ApiClient.updateProfile(profileData);
      const newUser = { ...currentUser, ...updated };
      setCurrentUser(newUser);
      localStorage.setItem('civicpulse_user', JSON.stringify(newUser));
      toast.success('Profile updated successfully!');
      return newUser;
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        loading,
        login,
        register,
        logout,
        updateProfile,
        refreshUser: loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
