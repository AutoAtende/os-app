import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Avatar,
  IconButton,
  Divider
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { 
  Save, 
  PhotoCamera,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    passwordConfirmation: ''
  });
  const [avatar, setAvatar] = useState({
    preview: user?.avatar_url,
    file: null
  });

  const handleAvatarChange = (event) => {
    if (event.target.files?.[0]) {
      const file = event.target.files[0];
      setAvatar({
        preview: URL.createObjectURL(file),
        file
      });
    }
  };

  const removeAvatar = () => {
    setAvatar({
      preview: null,
      file: null
    });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Nome é obrigatório');
      return false;
    }

    if (formData.newPassword) {
      if (!formData.currentPassword) {
        setError('Senha atual é obrigatória para alterar a senha');
        return false;
      }

      if (formData.newPassword.length < 6) {
        setError('A nova senha deve ter no mínimo 6 caracteres');
        return false;
      }

      if (formData.newPassword !== formData.passwordConfirmation) {
        setError('As senhas não conferem');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formPayload = new FormData();
      formPayload.append('name', formData.name);
      
      if (formData.currentPassword) {
        formPayload.append('currentPassword', formData.currentPassword);
        formPayload.append('newPassword', formData.newPassword);
      }

      if (avatar.file) {
        formPayload.append('avatar', avatar.file);
      }

      if (avatar.preview === null && user?.avatar_url) {
        formPayload.append('removeAvatar', 'true');
      }

      const response = await api.put('/users/profile', formPayload);
      await updateUser(response.data);
      setSuccess('Perfil atualizado com sucesso!');
      
      // Limpa os campos de senha
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        passwordConfirmation: ''
      }));
    } catch (error) {
      setError(error.response?.data?.message || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
        Meu Perfil
      </Typography>

      <Paper sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={avatar.preview}
                  sx={{ width: 120, height: 120 }}
                />
                <IconButton
                  color="primary"
                  component="label"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: 'background.paper'
                  }}
                >
                  <input
                    hidden
                    accept="image/*"
                    type="file"
                    onChange={handleAvatarChange}
                  />
                  <PhotoCamera />
                </IconButton>
                {(avatar.preview || user?.avatar_url) && (
                  <IconButton
                    color="error"
                    onClick={removeAvatar}
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      backgroundColor: 'background.paper'
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Nome"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                disabled
                label="Email"
                value={formData.email}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Alterar Senha
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                type="password"
                label="Senha Atual"
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="password"
                label="Nova Senha"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="password"
                label="Confirmar Nova Senha"
                value={formData.passwordConfirmation}
                onChange={(e) => setFormData({ ...formData, passwordConfirmation: e.target.value })}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <LoadingButton
              type="submit"
              variant="contained"
              loading={loading}
              startIcon={<Save />}
            >
              Salvar Alterações
            </LoadingButton>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default Profile;