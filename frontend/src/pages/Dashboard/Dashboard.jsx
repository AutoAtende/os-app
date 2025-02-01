import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from '@/services/api';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';

import {
  Wrench,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  MoreVertical,
  Calendar
} from 'lucide-react';

const STATUS_COLORS = {
  pending: "text-yellow-500",
  inProgress: "text-blue-500",
  completed: "text-green-500"
};

const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const [stats, setStats] = useState({
    summary: {
      total: 0,
      active: 0,
      maintenance: 0,
      pendingOrders: 0
    },
    maintenancesByType: [],
    maintenanceTrend: [],
    equipmentStats: [],
    performanceMetrics: {
      avgResolutionTime: 0,
      completionRate: 0,
      avgMaintenanceCost: 0
    }
  });

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get(`/dashboard/stats?period=${timeRange}`);
      setStats(response.data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Selecione o período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Última Semana</SelectItem>
            <SelectItem value="month">Último Mês</SelectItem>
            <SelectItem value="year">Último Ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Wrench className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Equipamentos</p>
                <h3 className="text-2xl font-bold">{stats.summary.total}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Equipamentos Ativos</p>
                <h3 className="text-2xl font-bold">{stats.summary.active}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <AlertCircle className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Em Manutenção</p>
                <h3 className="text-2xl font-bold">{stats.summary.maintenance}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <TrendingUp className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">OS Pendentes</p>
                <h3 className="text-2xl font-bold">{stats.summary.pendingOrders}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Tendência de Manutenções</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.maintenanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="preventive"
                    name="Preventivas"
                    stroke="#0088FE"
                  />
                  <Line
                    type="monotone"
                    dataKey="corrective"
                    name="Corretivas"
                    stroke="#00C49F"
                  />
                  <Line
                    type="monotone"
                    dataKey="predictive"
                    name="Preditivas"
                    stroke="#FFBB28"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Distribuição por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.maintenancesByType}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {stats.maintenancesByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Métricas de Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium">Tempo Médio de Resolução</p>
                <span className="text-2xl font-bold">
                  {stats.performanceMetrics.avgResolutionTime} horas
                </span>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium">Taxa de Conclusão</p>
                <span className="text-2xl font-bold">
                  {stats.performanceMetrics.completionRate}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium">Custo Médio por Manutenção</p>
                <span className="text-2xl font-bold">
                  R$ {stats.performanceMetrics.avgMaintenanceCost}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximas Manutenções</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.upcomingMaintenances?.map((maintenance) => (
                <div
                  key={maintenance.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted"
                >
                  <div className="flex items-center space-x-4">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{maintenance.equipment.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(maintenance.scheduledDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${STATUS_COLORS[maintenance.status]}`}>
                    {maintenance.type}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;