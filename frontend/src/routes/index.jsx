// src/routes/index.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import Login from '../pages/Login';

// Páginas
import Dashboard from '../pages/Dashboard';
import EquipmentList from '../pages/Equipment/EquipmentList';
import EquipmentForm from '../pages/Equipment/EquipmentForm';
import EquipmentQRCode from '../pages/Equipment/EquipmentQRCode';
import MaintenanceList from '../pages/Maintenance/MaintenanceList';
import MaintenanceForm from '../pages/Maintenance/MaintenanceForm';
import ServiceOrderList from '../pages/ServiceOrder/ServiceOrderList';
import ServiceOrderForm from '../pages/ServiceOrder/ServiceOrderForm';
import UserList from '../pages/User/UserList';
import UserForm from '../pages/User/UserForm';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';

function Router() {
  const { signed, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      {!signed ? (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      ) : (
        <>
          <Route path="/" element={<Layout />}>
            {/* Dashboard */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* Equipamentos */}
            <Route path="equipment">
              <Route index element={<EquipmentList />} />
              <Route path="new" element={<EquipmentForm />} />
              <Route path=":id/edit" element={<EquipmentForm />} />
              <Route path=":id/qrcode" element={<EquipmentQRCode />} />
            </Route>

            {/* Manutenções */}
            <Route path="maintenance">
              <Route index element={<MaintenanceList />} />
              <Route path="new" element={<MaintenanceForm />} />
              <Route path=":id/edit" element={<MaintenanceForm />} />
            </Route>

            {/* Ordens de Serviço */}
            <Route path="service-orders">
              <Route index element={<ServiceOrderList />} />
              <Route path="new" element={<ServiceOrderForm />} />
              <Route path=":id/edit" element={<ServiceOrderForm />} />
            </Route>

            {/* Usuários - Apenas admin */}
            {user?.role === 'admin' && (
              <Route path="users">
                <Route index element={<UserList />} />
                <Route path="new" element={<UserForm />} />
                <Route path=":id/edit" element={<UserForm />} />
              </Route>
            )}

            {/* Perfil e Configurações */}
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />

            {/* Rota 404 */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </>
      )}
    </Routes>
  );
}

export default Router;