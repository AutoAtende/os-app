import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  FormControlLabel,
  Switch,
  Divider
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Save, ArrowBack } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const UserForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirmation: '',
    role: 'technician',
    active: true
  });

  useEffect(() => {
    if (id) {
      loadUser();
    }
  }, [id]);

  const loadUser = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/users/${id}`);
      const { password, ...userData } = response.data;
      setFormData(userData);
    } catch (error) {
      setError('Erro ao carregar usuário');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Nome é obrigatório');
      return false;
    }

    if (!formData.email.trim()) {
      setError('Email é obrigatório');
      return false;
    }

    if (!id && !formData.password) {
      setError('Senha é obrigatória para novos usuários');
      return false;
    }

    if (formData.password && formData.password !== formData.passwordConfirmation) {
      setError('As senhas não conferem');
      return false;
    }

    if (formData.password && formData.password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    setError('');

    try {
      const { passwordConfirmation, ...submitData } = formData;
      
      if (id) {
        if (!submitData.password) {
          delete submitData.password;
        }
        await api.put(`/users/${id}`, submitData);
      } else {
        await api.post('/users', submitData);
      }

      navigate('/usuarios');
    } catch (error) {
      setError(error.response?.data?.message || 'Erro ao salvar usuário');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h4" component="h1">
          {id ? 'Editar Usuário' : 'Novo Usuário'}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/usuarios')}
        >
          Voltar
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Nome"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type="email"
                label="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Função</InputLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  label="Função"
                  disabled={id === currentUser?.id}
                >
                  <MenuItem value="technician">Técnico</MenuItem>
                  <MenuItem value="manager">Gerente</MenuItem>
                  <MenuItem value="admin">Administrador</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    disabled={id === currentUser?.id}
                  />
                }
                label="Usuário Ativo"
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Senha
              </Typography>
              {id && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Preencha apenas se desejar alterar a senha
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="password"
                label={id ? "Nova Senha" : "Senha"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!id}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="password"
                label="Confirmar Senha"
                value={formData.passwordConfirmation}
                onChange={(e) => setFormData({ ...formData, passwordConfirmation: e.target.value })}
                required={!id || formData.password}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/usuarios')}
            >
              Cancelar
            </Button>
            <LoadingButton
              type="submit"
              variant="contained"
              loading={saving}
              startIcon={<Save />}
            >
              Salvar
            </LoadingButton>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default UserForm;