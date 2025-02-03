import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControlLabel,
  Switch,
  TextField,
  Button,
  Alert,
  Divider,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { 
  Save,
  Notifications,
  Email,
  Settings as SettingsIcon
} from '@mui/icons-material';
import api from '../services/api';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      maintenanceReminder: true,
      maintenanceOverdue: true,
      equipmentStatusChange: true
    },
    maintenance: {
      defaultFrequency: 30,
      reminderDays: 7,
      criticalAgeMonths: 12
    },
    email: {
      reminderTime: '08:00',
      dailyReportTime: '18:00',
      reportRecipients: ''
    }
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await api.get('/settings');
      setSettings(response.data);
    } catch (error) {
      setError('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await api.put('/settings', settings);
      setSuccess('Configurações salvas com sucesso!');
    } catch (error) {
      setError('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationChange = (field) => (event) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [field]: event.target.checked
      }
    });
  };

  const handleMaintenanceChange = (field, value) => {
    setSettings({
      ...settings,
      maintenance: {
        ...settings.maintenance,
        [field]: value
      }
    });
  };

  const handleEmailChange = (field, value) => {
    setSettings({
      ...settings,
      email: {
        ...settings.email,
        [field]: value
      }
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        Carregando...
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
        Configurações
      </Typography>

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
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Notifications sx={{ mr: 1 }} />
                  <Typography variant="h6">Notificações</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.email}
                        onChange={handleNotificationChange('email')}
                      />
                    }
                    label="Notificações por Email"
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.push}
                        onChange={handleNotificationChange('push')}
                      />
                    }
                    label="Notificações Push"
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.maintenanceReminder}
                        onChange={handleNotificationChange('maintenanceReminder')}
                      />
                    }
                    label="Lembrete de Manutenção"
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.maintenanceOverdue}
                        onChange={handleNotificationChange('maintenanceOverdue')}
                      />
                    }
                    label="Alerta de Manutenção Atrasada"
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.equipmentStatusChange}
                        onChange={handleNotificationChange('equipmentStatusChange')}
                      />
                    }
                    label="Mudança de Status do Equipamento"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SettingsIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Manutenção</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Frequência Padrão de Manutenção (dias)"
                      value={settings.maintenance.defaultFrequency}
                      onChange={(e) => handleMaintenanceChange('defaultFrequency', Number(e.target.value))}
                      InputProps={{ inputProps: { min: 1 } }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Dias de Antecedência para Lembrete"
                      value={settings.maintenance.reminderDays}
                      onChange={(e) => handleMaintenanceChange('reminderDays', Number(e.target.value))}
                      InputProps={{ inputProps: { min: 1 } }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Idade Crítica do Equipamento (meses)"
                      value={settings.maintenance.criticalAgeMonths}
                      onChange={(e) => handleMaintenanceChange('criticalAgeMonths', Number(e.target.value))}
                      InputProps={{ inputProps: { min: 1 } }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Email sx={{ mr: 1 }} />
                  <Typography variant="h6">Configurações de Email</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="time"
                      label="Horário dos Lembretes"
                      value={settings.email.reminderTime}
                      onChange={(e) => handleEmailChange('reminderTime', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="time"
                      label="Horário do Relatório Diário"
                      value={settings.email.dailyReportTime}
                      onChange={(e) => handleEmailChange('dailyReportTime', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Destinatários dos Relatórios (um por linha)"
                      value={settings.email.reportRecipients}
                      onChange={(e) => handleEmailChange('reportRecipients', e.target.value)}
                      placeholder="email@exemplo.com&#10;outro@exemplo.com"
                      helperText="Digite um endereço de email por linha"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={saving}
            startIcon={<Save />}
          >
            Salvar Configurações
          </LoadingButton>
        </Box>
      </form>
    </Box>
  );
};

export default Settings;