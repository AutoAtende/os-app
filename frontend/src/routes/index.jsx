import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout/Layout';

// Pages
import Login from '../pages/Login/Login';
import Dashboard from '../pages/Dashboard/Dashboard';
import EquipmentList from '../pages/Equipment/EquipmentList';
import EquipmentForm from '../pages/Equipment/EquipmentForm';
import ServiceOrderList from '../pages/ServiceOrder/ServiceOrderList';
import ServiceOrderForm from '../pages/ServiceOrder/ServiceOrderForm';
import UserList from '../pages/User/UserList';
import UserForm from '../pages/User/UserForm';
import Profile from '../pages/Profile/Profile';
import Settings from '../pages/Settings/Settings';

const PrivateRoute = ({ children }) => {
  const { signed, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  return signed ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  return user?.role === 'admin' ? children : <Navigate to="/dashboard" />;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" />} />
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

          <Route
            path="usuarios"
            element={
              <AdminRoute>
                <UserList />
              </AdminRoute>
            }
          />
          <Route
            path="usuarios/novo"
            element={
              <AdminRoute>
                <UserForm />
              </AdminRoute>
            }
          />
          <Route
            path="usuarios/:id/editar"
            element={
              <AdminRoute>
                <UserForm />
              </AdminRoute>
            }
          />

          <Route path="perfil" element={<Profile />} />
          <Route path="configuracoes" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;