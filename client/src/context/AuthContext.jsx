import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, userAPI } from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    if (token) {
      syncUser();
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await authAPI.login({ email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return data;
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      return await authAPI.register(userData);
    } catch (err) {
      console.error('Registration error:', err);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const syncUser = async () => {
    try {
      const { data } = await userAPI.getMe();
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
    } catch (err) {
      console.error('Error syncing user:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, syncUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
