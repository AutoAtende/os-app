import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Box,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Build,
  Warning,
  CheckCircle,
  MoreVert,
  TrendingUp
} from '@mui/icons-material';
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
import api from '../../services/api';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    maintenancesByType: [],
    maintenancesTrend: [],
    equipmentStats: [],
    summary: {
      total: 0,
      active: 0,
      maintenance: 0,
      pendingOrders: 0
    }
  });
  const [timeRange, setTimeRange] = useState('month');
  const [anchorEl, setAnchorEl] = useState(null);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get(`/dashboard/stats?range=${timeRange}`);
      setStats(response.data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    handleMenuClose();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={3}>
        {/* Cards de Resumo */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Build sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
              <Box>
                <Typography variant="h4">{stats.summary.total}</Typography>
                <Typography color="textSecondary">Total de Equipamentos</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircle sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
              <Box>
                <Typography variant="h4">{stats.summary.active}</Typography>
                <Typography color="textSecondary">Equipamentos Ativos</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Warning sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
              <Box>
                <Typography variant="h4">{stats.summary.maintenance}</Typography>
                <Typography color="textSecondary">Em Manutenção</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUp sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
              <Box>
                <Typography variant="h4">{stats.summary.pendingOrders}</Typography>
                <Typography color="textSecondary">OS Pendentes</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Gráfico de Linha - Tendência de Manutenções */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader
              title="Tendência de Manutenções"
              action={
                <>
                  <IconButton onClick={handleMenuClick}>
                    <MoreVert />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                  >
                    <MenuItem onClick={() => handleTimeRangeChange('week')}>Última Semana</MenuItem>
                    <MenuItem onClick={() => handleTimeRangeChange('month')}>Último Mês</MenuItem>
                    <MenuItem onClick={() => handleTimeRangeChange('year')}>Último Ano</MenuItem>
                  </Menu>
                </>
              }
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.maintenancesTrend}>
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
          </CardContent>
        </Card>
      </Grid>

      {/* Gráfico de Pizza - Tipos de Manutenção */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardHeader title="Distribuição por Tipo" />
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.maintenancesByType}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {stats.maintenancesByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Gráfico de Barras - Equipamentos mais Manutenidos */}
      <Grid item xs={12}>
        <Card>
          <CardHeader title="Equipamentos mais Manutenidos" />
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.equipmentStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="maintenanceCount" name="Quantidade" fill="#0088FE" />
                <Bar dataKey="cost" name="Custo Total (R$)" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Indicadores de Performance */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Indicadores de Performance" />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Tempo Médio de Resolução:</Typography>
                <Typography variant="h6">
                  {stats.metrics?.avgResolutionTime || 0} horas
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Taxa de Conclusão:</Typography>
                <Typography variant="h6">
                  {stats.metrics?.completionRate || 0}%
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Custo Médio por Manutenção:</Typography>
                <Typography variant="h6">
                  R$ {stats.metrics?.avgMaintenanceCost || 0}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Manutenções Programadas */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Próximas Manutenções Programadas" />
          <CardContent>
            {stats.scheduledMaintenances?.map((maintenance, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                  p: 1,
                  borderRadius: 1,
                  bgcolor: 'background.default'
                }}
              >
                <Box>
                  <Typography variant="subtitle1">
                    {maintenance.equipment.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {new Date(maintenance.scheduledDate).toLocaleDateString()}
                  </Typography>
                </Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: 'warning.main',
                    bgcolor: 'warning.light',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1
                  }}
                >
                  {maintenance.type}
                </Typography>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Grid>
      </Grid>
    </Box>
)};

export default Dashboard;