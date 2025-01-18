import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData() {
      const storedToken = localStorage.getItem('@EquipmentManagement:token');
      const storedUser = localStorage.getItem('@EquipmentManagement:user');

      if (storedToken && storedUser) {
        api.defaults.headers.authorization = `Bearer ${storedToken}`;
        setUser(JSON.parse(storedUser));
      }

      setLoading(false);
    }

    loadStorageData();
  }, []);

  async function signIn({ email, password }) {
    try {
      const response = await api.post('/login', { email, password });
      const { token, user } = response.data;

      localStorage.setItem('@EquipmentManagement:token', token);
      localStorage.setItem('@EquipmentManagement:user', JSON.stringify(user));

      api.defaults.headers.authorization = `Bearer ${token}`;
      setUser(user);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao realizar login'
      };
    }
  }

  function signOut() {
    localStorage.removeItem('@EquipmentManagement:token');
    localStorage.removeItem('@EquipmentManagement:user');
    setUser(null);
  }

  async function updateUser(userData) {
    try {
      const response = await api.put('/users', userData);
      const updatedUser = response.data;

      localStorage.setItem('@EquipmentManagement:user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erro ao atualizar usuário'
      };
    }
  }

  return (
    <AuthContext.Provider value={{
      signed: !!user,
      user,
      loading,
      signIn,
      signOut,
      updateUser
    }}>
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