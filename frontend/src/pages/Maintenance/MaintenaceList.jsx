import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Table,
  Badge,
  Button,
  Input,
  DateRangePicker,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui';
import { Plus, Search, Filter, MoreVertical, Edit, FileText } from 'lucide-react';
import api from '../services/api';

export default function MaintenanceList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [maintenances, setMaintenances] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    type: '',
    dateRange: null
  });

  const fetchMaintenances = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        start_date: filters.dateRange?.from,
        end_date: filters.dateRange?.to
      };
      const response = await api.get('/maintenance', { params });
      setMaintenances(response.data);
    } catch (error) {
      console.error('Erro ao buscar manutenções:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenances();
  }, [filters]);

  const getStatusBadge = (status) => {
    const config = {
      pending: { label: 'Pendente', variant: 'warning' },
      in_progress: { label: 'Em Andamento', variant: 'primary' },
      completed: { label: 'Concluída', variant: 'success' },
      cancelled: { label: 'Cancelada', variant: 'destructive' }
    };

    return <Badge variant={config[status].variant}>{config[status].label}</Badge>;
  };

  const getTypeBadge = (type) => {
    const config = {
      corrective: { label: 'Corretiva', color: 'bg-red-100 text-red-800' },
      preventive: { label: 'Preventiva', color: 'bg-green-100 text-green-800' },
      predictive: { label: 'Preditiva', color: 'bg-blue-100 text-blue-800' }
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config[type].color}`}>
        {config[type].label}
      </span>
    );
  };

  const columns = [
    {
      header: 'Equipamento',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.equipment.name}</div>
          <div className="text-sm text-gray-500">{row.original.equipment.code}</div>
        </div>
      )
    },
    {
      header: 'Tipo',
      cell: ({ row }) => getTypeBadge(row.original.type)
    },
    {
      header: 'Status',
      cell: ({ row }) => getStatusBadge(row.original.status)
    },
    {
      header: 'Data Agendada',
      cell: ({ row }) => new Date(row.original.scheduled_for).toLocaleDateString()
    },
    {
      header: 'Responsável',
      cell: ({ row }) => row.original.technician?.name || '-'
    },
    {
      header: 'Custo',
      cell: ({ row }) => row.original.cost ? 
        new Intl.NumberFormat('pt-BR', { 
          style: 'currency', 
          currency: 'BRL' 
        }).format(row.original.cost) : 
        '-'
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onClick={() => navigate(`/maintenance/${row.original.id}/edit`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => navigate(`/maintenance/${row.original.id}/report`)}
            >
              <FileText className="mr-2 h-4 w-4" />
              Gerar Relatório
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Manutenções</h1>
        <Button onClick={() => navigate('/maintenance/new')}>
          <Plus className="mr-2 h-4 w-4" /> Nova Manutenção
        </Button>
      </div>

      <Card>
        <div className="p-4">
          <div className="flex gap-4 flex-wrap mb-4">
            <Input
              placeholder="Buscar manutenções..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              leftIcon={<Search className="h-4 w-4 text-gray-400" />}
              className="max-w-xs"
            />

            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({...filters, status: value})}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="in_progress">Em Andamento</SelectItem>
                <SelectItem value="completed">Concluídas</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.type}
              onValueChange={(value) => setFilters({...filters, type: value})}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="corrective">Corretiva</SelectItem>
                <SelectItem value="preventive">Preventiva</SelectItem>
                <SelectItem value="predictive">Preditiva</SelectItem>
              </SelectContent>
            </Select>

            <DateRangePicker
              value={filters.dateRange}
              onChange={(range) => setFilters({...filters, dateRange: range})}
              placeholder="Período"
            />
          </div>

          <Table
            columns={columns}
            data={maintenances}
            loading={loading}
          />
        </div>
      </Card>
    </div>
  );
}