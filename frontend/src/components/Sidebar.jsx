// src/components/Sidebar.jsx
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard,
  Wrench,
  ClipboardList,
  Settings,
  Users
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { 
      text: 'Dashboard', 
      icon: <LayoutDashboard className="w-4 h-4" />, 
      path: '/' 
    },
    { 
      text: 'Equipamentos', 
      icon: <Wrench className="w-4 h-4" />, 
      path: '/equipamentos' 
    },
    { 
      text: 'Manutenções', 
      icon: <ClipboardList className="w-4 h-4" />, 
      path: '/manutencoes' 
    },
    { 
      text: 'Usuários', 
      icon: <Users className="w-4 h-4" />, 
      path: '/usuarios',
      admin: true
    },
    { 
      text: 'Configurações', 
      icon: <Settings className="w-4 h-4" />, 
      path: '/configuracoes' 
    },
  ];

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r bg-background px-6">
        <div className="flex h-14 items-center border-b">
          <span className="text-lg font-semibold">Sistema de Gestão</span>
        </div>
        
        <ScrollArea className="flex-1">
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="space-y-1">
                  {menuItems.map((item) => (
                    (!item.admin || user?.role === 'admin') && (
                      <li key={item.path}>
                        <Button
                          variant={location.pathname === item.path ? "secondary" : "ghost"}
                          className="w-full justify-start"
                          onClick={() => navigate(item.path)}
                        >
                          {item.icon}
                          <span className="ml-2">{item.text}</span>
                        </Button>
                      </li>
                    )
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
        </ScrollArea>
      </div>
    </div>
  );
};

export default Sidebar;