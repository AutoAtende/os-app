// src/routes/index.jsx
import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import ErrorBoundary from '@/components/ErrorBoundary';

// Lazy loading das páginas
const Login = lazy(() => import('@/pages/Login/Login'));
const Dashboard = lazy(() => import('@/pages/Dashboard/Dashboard'));
const EquipmentList = lazy(() => import('@/pages/Equipment/EquipmentList'));
const EquipmentForm = lazy(() => import('@/pages/Equipment/EquipmentForm'));
const MaintenanceList = lazy(() => import('@/pages/Maintenance/MaintenanceList'));
const MaintenanceForm = lazy(() => import('@/pages/Maintenance/MaintenanceForm'));
const Profile = lazy(() => import('@/pages/Profile/Profile'));

const Router = () => {
  const { signed, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/login" element={
          !signed ? <Login /> : <Navigate to="/" />
        } />

        <Route path="/" element={
          signed ? <Layout /> : <Navigate to="/login" />
        }>
          <Route index element={<Dashboard />} />
          <Route path="equipamentos">
            <Route index element={<EquipmentList />} />
            <Route path="novo" element={<EquipmentForm />} />
            <Route path=":id/editar" element={<EquipmentForm />} />
          </Route>
          <Route path="manutencoes">
            <Route index element={<MaintenanceList />} />
            <Route path="nova" element={<MaintenanceForm />} />
            <Route path=":id/editar" element={<MaintenanceForm />} />
          </Route>
          <Route path="perfil" element={<Profile />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
};

export default Router;