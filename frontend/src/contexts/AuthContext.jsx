import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '@/services/api';
import { useToast } from "@/components/ui/use-toast";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function loadStorageData() {
      try {
        const storedToken = localStorage.getItem('@EquipmentManagement:token');
        const storedUser = localStorage.getItem('@EquipmentManagement:user');

        if (storedToken && storedUser) {
          api.defaults.headers.authorization = `Bearer ${storedToken}`;
          setUser(JSON.parse(storedUser));

          // Validar token
          const response = await api.post('/auth/validate-token', { token: storedToken });
          if (!response.data.valid) {
            throw new Error('Token inválido');
          }
        }
      } catch (error) {
        localStorage.removeItem('@EquipmentManagement:token');
        localStorage.removeItem('@EquipmentManagement:user');
        setUser(null);
        toast({
          variant: "destructive",
          title: "Sessão expirada",
          description: "Por favor, faça login novamente."
        });
      } finally {
        setLoading(false);
      }
    }
    loadStorageData();
  }, [toast]);

  async function signIn({ email, password }) {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;

      localStorage.setItem('@EquipmentManagement:token', token);
      localStorage.setItem('@EquipmentManagement:user', JSON.stringify(user));
      
      api.defaults.headers.authorization = `Bearer ${token}`;
      setUser(user);

      toast({
        title: "Login realizado com sucesso",
        description: `Bem-vindo(a), ${user.name}!`
      });

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Erro ao realizar login';
      toast({
        variant: "destructive",
        title: "Erro no login",
        description: message
      });
      return { success: false, error: message };
    }
  }

  function signOut() {
    localStorage.removeItem('@EquipmentManagement:token');
    localStorage.removeItem('@EquipmentManagement:user');
    setUser(null);
    delete api.defaults.headers.authorization;
  }

  async function updateUser(userData) {
    try {
      const response = await api.put('/users/profile', userData);
      const updatedUser = response.data;
      
      localStorage.setItem('@EquipmentManagement:user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso!"
      });

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Erro ao atualizar usuário';
      toast({
        variant: "destructive",
        title: "Erro ao atualizar perfil",
        description: message
      });
      return { success: false, error: message };
    }
  }

  async function updatePassword({ currentPassword, newPassword }) {
    try {
      await api.put('/users/password', { currentPassword, newPassword });

      toast({
        title: "Senha atualizada",
        description: "Sua senha foi alterada com sucesso!"
      });

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Erro ao atualizar senha';
      toast({
        variant: "destructive",
        title: "Erro ao atualizar senha",
        description: message
      });
      return { success: false, error: message };
    }
  }

  return (
    <AuthContext.Provider value={{
      signed: !!user,
      user,
      loading,
      signIn,
      signOut,
      updateUser,
      updatePassword
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