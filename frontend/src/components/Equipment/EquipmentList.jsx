import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Menu,
  MenuItem,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  MoreVert,
  QrCode,
  Edit,
  Delete,
  Download
} from '@mui/icons-material';
import api from '../../services/api';

const EquipmentList = () => {
  const navigate = useNavigate();
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    department: '',
    status: ''
  });
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);

  useEffect(() => {
    fetchEquipments();
  }, [page, rowsPerPage, searchTerm, filters]);

  const fetchEquipments = async () => {
    try {
      const response = await api.get('/equipment', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          search: searchTerm,
          ...filters
        }
      });

      setEquipments(response.data.items);
      setTotalCount(response.data.total);
    } catch (error) {
      console.error('Erro ao carregar equipamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleFilterChange = (event) => {
    setFilters({
      ...filters,
      [event.target.name]: event.target.value
    });
    setPage(0);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleActionClick = (event, equipment) => {
    setSelectedEquipment(equipment);
    setActionMenuAnchor(event.currentTarget);
  };

  const handleActionClose = () => {
    setActionMenuAnchor(null);
    setSelectedEquipment(null);
  };

  const handleEdit = () => {
    navigate(`/equipamentos/${selectedEquipment.id}/editar`);
    handleActionClose();
  };

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja excluir este equipamento?')) {
      try {
        await api.delete(`/equipment/${selectedEquipment.id}`);
        fetchEquipments();
      } catch (error) {
        console.error('Erro ao excluir equipamento:', error);
      }
    }
    handleActionClose();
  };

  const handleExportQRCode = () => {
    window.open(`/api/equipment/${selectedEquipment.id}/qrcode`, '_blank');
    handleActionClose();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'maintenance':
        return 'warning';
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'maintenance':
        return 'Em Manutenção';
      case 'inactive':
        return 'Inativo';
      default:
        return status;
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h4" component="h1">
          Equipamentos
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/equipamentos/novo')}
        >
          Novo Equipamento
        </Button>
      </Box>

      <Paper sx={{ mb: 2, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Buscar equipamentos..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              )
            }}
          />
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => setFilterDialogOpen(true)}
          >
            Filtros
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={() => window.open('/api/equipment/export', '_blank')}
          >
            Exportar
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Código</TableCell>
                <TableCell>Departamento</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Última Manutenção</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {equipments.map((equipment) => (
                <TableRow key={equipment.id}>
                  <TableCell>{equipment.name}</TableCell>
                  <TableCell>{equipment.code}</TableCell>
                  <TableCell>{equipment.department}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(equipment.status)}
                      color={getStatusColor(equipment.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {equipment.last_maintenance
                      ? new Date(equipment.last_maintenance).toLocaleDateString()
                      : 'Nunca realizada'}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={(event) => handleActionClick(event, equipment)}
                    >
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>

      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionClose}
      >
        <MenuItem onClick={handleEdit}>
          <Edit fontSize="small" sx={{ mr: 1 }} /> Editar
        </MenuItem>
        <MenuItem onClick={handleExportQRCode}>
          <QrCode fontSize="small" sx={{ mr: 1 }} /> Exportar QR Code
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <Delete fontSize="small" sx={{ mr: 1 }} /> Excluir
        </MenuItem>
      </Menu>

      <Dialog
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
      >
        <DialogTitle>Filtros</DialogTitle>
        <DialogContent>
          <Box sx={{ minWidth: 300, mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Departamento</InputLabel>
              <Select
                name="department"
                value={filters.department}
                onChange={handleFilterChange}
                label="Departamento"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="TI">TI</MenuItem>
                <MenuItem value="Produção">Produção</MenuItem>
                <MenuItem value="Manutenção">Manutenção</MenuItem>
              </Select>
              </FormControl>

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                label="Status"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="active">Ativo</MenuItem>
                <MenuItem value="maintenance">Em Manutenção</MenuItem>
                <MenuItem value="inactive">Inativo</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setFilters({ department: '', status: '' });
            setFilterDialogOpen(false);
          }}>
            Limpar
          </Button>
          <Button 
            variant="contained" 
            onClick={() => setFilterDialogOpen(false)}
          >
            Aplicar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EquipmentList;