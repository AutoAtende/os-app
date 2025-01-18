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
  CircularProgress,
  Switch,
  FormControlLabel,
  Divider
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Save, ArrowBack, Upload } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import api from '../../services/api';

const EquipmentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    serial_number: '',
    department: '',
    description: '',
    maintenance_frequency: 30,
    status: 'active'
  });
  const [images, setImages] = useState([]);
  const [manualFile, setManualFile] = useState(null);

  useEffect(() => {
    if (id) {
      loadEquipment();
    }
  }, [id]);

  const loadEquipment = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/equipment/${id}`);
      setFormData(response.data);
      if (response.data.images) {
        setImages(response.data.images);
      }
      if (response.data.manual_url) {
        setManualFile({ preview: response.data.manual_url });
      }
    } catch (error) {
      setError('Erro ao carregar equipamento');
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    onDrop: (acceptedFiles) => {
      setImages([
        ...images,
        ...acceptedFiles.map(file => Object.assign(file, {
          preview: URL.createObjectURL(file)
        }))
      ]);
    }
  });

  const handleManualUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setManualFile(Object.assign(file, {
        preview: URL.createObjectURL(file)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const formPayload = new FormData();

      // Adiciona os dados do formulário
      Object.keys(formData).forEach(key => {
        formPayload.append(key, formData[key]);
      });

      // Adiciona as imagens
      images.forEach((image, index) => {
        if (!image.url) { // Apenas envia se for uma nova imagem
          formPayload.append(`images`, image);
        }
      });

      // Adiciona o manual se houver
      if (manualFile && !manualFile.url) {
        formPayload.append('manual', manualFile);
      }

      if (id) {
        await api.put(`/equipment/${id}`, formPayload);
      } else {
        await api.post('/equipment', formPayload);
      }

      navigate('/equipamentos');
    } catch (error) {
      setError(error.response?.data?.message || 'Erro ao salvar equipamento');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h4" component="h1">
          {id ? 'Editar Equipamento' : 'Novo Equipamento'}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/equipamentos')}
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
                label="Nome do Equipamento"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Código"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Número de Série"
                value={formData.serial_number}
                onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Departamento</InputLabel>
                <Select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  label="Departamento"
                >
                  <MenuItem value="TI">TI</MenuItem>
                  <MenuItem value="Produção">Produção</MenuItem>
                  <MenuItem value="Manutenção">Manutenção</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Descrição"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Frequência de Manutenção (dias)"
                value={formData.maintenance_frequency}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  maintenance_frequency: parseInt(e.target.value) 
                })}
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  label="Status"
                >
                  <MenuItem value="active">Ativo</MenuItem>
                  <MenuItem value="maintenance">Em Manutenção</MenuItem>
                  <MenuItem value="inactive">Inativo</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2 }}>
                Imagens do Equipamento
              </Typography>

              <Box
                {...getRootProps()}
                sx={{
                  border: '2px dashed #ccc',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  mb: 2
                }}
              >
                <input {...getInputProps()} />
                <Upload sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                <Typography>
                  Arraste imagens aqui ou clique para selecionar
                </Typography>
              </Box>

              <Grid container spacing={2}>
                {images.map((image, index) => (
                  <Grid item key={index} xs={6} sm={4} md={3}>
                    <Box
                      sx={{
                        position: 'relative',
                        paddingTop: '100%',
                        border: '1px solid #eee',
                        borderRadius: 1,
                        overflow: 'hidden'
                      }}
                    >
                      <img
                        src={image.preview || image.url}
                        alt={`Preview ${index + 1}`}
                        style={{
                          position: 'absolute',
                          top: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => handleRemoveImage(index)}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          minWidth: 'auto',
                          width: 32,
                          height: 32,
                          p: 0
                        }}
                      >
                        ×
                      </Button>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2 }}>
                Manual do Equipamento
              </Typography>

              <input
                type="file"
                accept=".pdf"
                id="manual-upload"
                style={{ display: 'none' }}
                onChange={handleManualUpload}
              />
              <label htmlFor="manual-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<Upload />}
                >
                  Upload do Manual (PDF)
                </Button>
              </label>

              {manualFile && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    Arquivo: {manualFile.name || 'Manual atual'}
                  </Typography>
                  <Button
                    color="error"
                    size="small"
                    onClick={() => setManualFile(null)}
                  >
                    Remover
                  </Button>
                </Box>
              )}
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/equipamentos')}
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

export default EquipmentForm;