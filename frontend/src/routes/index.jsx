import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout/Layout';
import Login from '@/pages/Login/Login';
import Dashboard from '@/pages/Dashboard/Dashboard';
import EquipmentList from '@/pages/Equipment/EquipmentList';
import EquipmentForm from '@/pages/Equipment/EquipmentForm';
import EquipmentQRCode from '@/pages/Equipment/EquipmentQRCode';
import ServiceOrderList from '@/pages/ServiceOrder/ServiceOrderList';
import ServiceOrderForm from '@/pages/ServiceOrder/ServiceOrderForm';
import Profile from '@/pages/Profile/Profile';
import Settings from '@/pages/Settings/Settings';

const PrivateRoute = ({ children }) => {
  const { signed, loading } = useAuth();
  console.log('Auth state:', { signed, loading });
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!signed) {
    return <Navigate to="/login" />;
  }

  return children;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rota Pública */}
      <Route path="/login" element={<Login />} />

      {/* Rotas Protegidas */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            
            <Layout />
          </PrivateRoute>
        }
      >
        {/* Rota inicial redireciona para dashboard */}
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        {/* Dashboard */}
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* Equipamentos */}
        <Route path="equipamentos">
          <Route index element={<EquipmentList />} />
          <Route path="novo" element={<EquipmentForm />} />
          <Route path=":id/editar" element={<EquipmentForm />} />
          <Route path=":id/qrcode" element={<EquipmentQRCode />} />
        </Route>

        {/* Ordens de Serviço */}
        <Route path="ordens-servico">
          <Route index element={<ServiceOrderList />} />
          <Route path="nova" element={<ServiceOrderForm />} />
          <Route path=":id/editar" element={<ServiceOrderForm />} />
        </Route>

        {/* Perfil e Configurações */}
        <Route path="perfil" element={<Profile />} />
        <Route path="configuracoes" element={<Settings />} />
      </Route>

      {/* Rota para páginas não encontradas */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;