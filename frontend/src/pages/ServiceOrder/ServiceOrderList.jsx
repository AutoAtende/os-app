import React, { useState, useEffect } from 'react';
import { Card, Badge } from '@/components/ui';
import { Calendar, Clock, Tool, AlertTriangle } from 'lucide-react';
import api from '../services/api';

export default function ServiceOrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
  });

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/service-orders', { params: filters });
      setOrders(response.data);
    } catch (error) {
      console.error('Erro ao buscar ordens de serviço:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };

    const labels = {
      pending: 'Pendente',
      in_progress: 'Em Andamento',
      completed: 'Concluído',
      cancelled: 'Cancelado'
    };

    return (
      <Badge className={styles[status]}>
        {labels[status]}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Ordens de Serviço</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          Nova Ordem
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <Card key={order.id} className="p-4 hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg">{order.equipment.name}</h3>
                  {getStatusBadge(order.status)}
                </div>

                <p className="text-gray-600 line-clamp-2">{order.description}</p>

                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Agendado para: {new Date(order.scheduled_for).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Horário: {new Date(order.scheduled_for).toLocaleTimeString()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Tool className="w-4 h-4" />
                    <span>Técnico: {order.technician?.name || 'Não atribuído'}</span>
                  </div>

                  {order.priority === 'high' && (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Prioridade Alta</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}