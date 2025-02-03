import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout/Layout';

// Pages
import Login from '@/pages/Login/Login';
import Dashboard from '@/pages/Dashboard/Dashboard';
import EquipmentList from '@/pages/Equipment/EquipmentList';
import EquipmentForm from '@/pages/Equipment/EquipmentForm';
import ServiceOrderList from '@/pages/ServiceOrder/ServiceOrderList';
import ServiceOrderForm from '@/pages/ServiceOrder/ServiceOrderForm';
import UserList from '@/pages/User/UserList';
import UserForm from '@/pages/User/UserForm';
import Profile from '@/pages/Profile/Profile';
import Settings from '@/pages/Settings/Settings';

// Componente para rotas protegidas
const PrivateRoute = ({ children }) => {
  const { signed, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return signed ? children : <Navigate to="/login" />;
};

// Componente para rotas de admin
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return user?.role === 'admin' ? children : <Navigate to="/dashboard" />;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota pública */}
        <Route path="/login" element={<Login />} />
        
        {/* Rotas protegidas */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          <Route path="equipamentos">
            <Route index element={<EquipmentList />} />
            <Route path="novo" element={<EquipmentForm />} />
            <Route path=":id/editar" element={<EquipmentForm />} />
          </Route>

          <Route path="ordens-servico">
            <Route index element={<ServiceOrderList />} />
            <Route path="nova" element={<ServiceOrderForm />} />
            <Route path=":id/editar" element={<ServiceOrderForm />} />
          </Route>

          {/* Rotas administrativas */}
          <Route path="usuarios" element={<AdminRoute><UserList /></AdminRoute>} />
          <Route path="usuarios/novo" element={<AdminRoute><UserForm /></AdminRoute>} />
          <Route path="usuarios/:id/editar" element={<AdminRoute><UserForm /></AdminRoute>} />

          <Route path="perfil" element={<Profile />} />
          <Route path="configuracoes" element={<Settings />} />
        </Route>

        {/* Rota para caminhos não encontrados */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;