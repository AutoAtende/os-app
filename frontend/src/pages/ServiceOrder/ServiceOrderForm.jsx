import React, { useState, useEffect, useRef } from 'react';
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
  Divider,
  Card,
  CardMedia,
  IconButton
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { 
  Save, 
  ArrowBack, 
  Upload, 
  Delete,
  Camera,
  ClearAll
} from '@mui/icons-material';
import SignatureCanvas from 'react-signature-canvas';
import { useDropzone } from 'react-dropzone';
import { DateTimePicker } from '@mui/x-date-pickers';
import api from '../../services/api';

const ServiceOrderForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const signatureRef = useRef();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [equipments, setEquipments] = useState([]);
  const [formData, setFormData] = useState({
    equipment_id: '',
    description: '',
    type: 'corrective',
    priority: 'medium',
    scheduled_for: new Date(),
    notes: '',
    cost: '',
    parts_replaced: []
  });
  const [photos, setPhotos] = useState([]);
  const [signature, setSignature] = useState(null);

  useEffect(() => {
    fetchEquipments();
    if (id) {
      loadServiceOrder();
    }
  }, [id]);

  const fetchEquipments = async () => {
    try {
      const response = await api.get('/equipment');
      setEquipments(response.data);
    } catch (error) {
      console.error('Erro ao carregar equipamentos:', error);
    }
  };

  const loadServiceOrder = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/service-orders/${id}`);
      const { photos: servicePhotos, signature: serviceSignature, ...orderData } = response.data;
      
      setFormData(orderData);
      if (servicePhotos) {
        setPhotos(servicePhotos.map(photo => ({
          preview: photo.url,
          id: photo.id
        })));
      }
      if (serviceSignature) {
        setSignature(serviceSignature);
      }
    } catch (error) {
      setError('Erro ao carregar ordem de serviço');
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    onDrop: (acceptedFiles) => {
      setPhotos([
        ...photos,
        ...acceptedFiles.map(file => Object.assign(file, {
          preview: URL.createObjectURL(file)
        }))
      ]);
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const formPayload = new FormData();

      // Adiciona os dados do formulário
      Object.keys(formData).forEach(key => {
        if (key === 'parts_replaced') {
          formPayload.append(key, JSON.stringify(formData[key]));
        } else {
          formPayload.append(key, formData[key]);
        }
      });

      // Adiciona as fotos
      photos.forEach((photo) => {
        if (!photo.id) { // Apenas envia se for uma nova foto
          formPayload.append('photos', photo);
        }
      });

      // Adiciona a assinatura se houver
      if (signature && !signature.id) {
        const signatureBlob = await new Promise(resolve => signatureRef.current.toBlob(resolve));
        formPayload.append('signature', signatureBlob, 'signature.png');
      }

      if (id) {
        await api.put(`/service-orders/${id}`, formPayload);
      } else {
        await api.post('/service-orders', formPayload);
      }

      navigate('/ordens-servico');
    } catch (error) {
      setError(error.response?.data?.message || 'Erro ao salvar ordem de serviço');
    } finally {
      setSaving(false);
    }
  };

  const handleRemovePhoto = (index) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };

  const handleAddPart = () => {
    setFormData({
      ...formData,
      parts_replaced: [
        ...formData.parts_replaced,
        { name: '', quantity: 1, cost: 0 }
      ]
    });
  };

  const handleRemovePart = (index) => {
    const newParts = [...formData.parts_replaced];
    newParts.splice(index, 1);
    setFormData({
      ...formData,
      parts_replaced: newParts
    });
  };

  const handlePartChange = (index, field, value) => {
    const newParts = [...formData.parts_replaced];
    newParts[index][field] = value;
    setFormData({
      ...formData,
      parts_replaced: newParts
    });
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
          {id ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/ordens-servico')}
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
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Equipamento</InputLabel>
                <Select
                  value={formData.equipment_id}
                  onChange={(e) => setFormData({
                    ...formData,
                    equipment_id: e.target.value
                  })}
                  label="Equipamento"
                >
                  {equipments.map((equipment) => (
                    <MenuItem key={equipment.id} value={equipment.id}>
                      {equipment.name} - {equipment.code}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                multiline
                rows={4}
                label="Descrição do Problema/Serviço"
                value={formData.description}
                onChange={(e) => setFormData({
                  ...formData,
                  description: e.target.value
                })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({
                    ...formData,
                    type: e.target.value
                  })}
                  label="Tipo"
                >
                  <MenuItem value="corrective">Corretiva</MenuItem>
                  <MenuItem value="preventive">Preventiva</MenuItem>
                  <MenuItem value="predictive">Preditiva</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Prioridade</InputLabel>
                <Select
                  value={formData.priority}
                  onChange={(e) => setFormData({
                    ...formData,
                    priority: e.target.value
                  })}
                  label="Prioridade"
                >
                  <MenuItem value="low">Baixa</MenuItem>
                  <MenuItem value="medium">Média</MenuItem>
                  <MenuItem value="high">Alta</MenuItem>
                  <MenuItem value="critical">Crítica</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <DateTimePicker
                label="Data e Hora Agendada"
                value={formData.scheduled_for}
                onChange={(date) => setFormData({
                  ...formData,
                  scheduled_for: date
                })}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2 }}>
                Fotos
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
                <Camera sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                <Typography>
                  Arraste fotos aqui ou clique para selecionar
                </Typography>
              </Box>

              <Grid container spacing={2}>
                {photos.map((photo, index) => (
                  <Grid item key={index} xs={6} sm={4} md={3}>
                    <Card>
                      <CardMedia
                        component="img"
                        height="140"
                        image={photo.preview}
                        alt={`Foto ${index + 1}`}
                      />
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemovePhoto(index)}
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          bgcolor: 'background.paper'
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2 }}>
                Peças Substituídas
              </Typography>

              {formData.parts_replaced.map((part, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Nome da Peça"
                        value={part.name}
                        onChange={(e) => handlePartChange(index, 'name', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={6} sm={2}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Quantidade"
                        value={part.quantity}
                        onChange={(e) => handlePartChange(index, 'quantity', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Custo Unitário"
                        value={part.cost}
                        onChange={(e) => handlePartChange(index, 'cost', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={1}>
                      <IconButton
                        color="error"
                        onClick={() => handleRemovePart(index)}
                      >
                        <Delete />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Box>
              ))}

              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={handleAddPart}
                sx={{ mt: 1 }}
              >
                Adicionar Peça
              </Button>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2 }}>
                Assinatura do Técnico
              </Typography>

              <Box
                sx={{
                  border: '1px solid #ccc',
                  borderRadius: 1,
                  bgcolor: '#fff',
                  mb: 1
                }}
              >
                <SignatureCanvas
                  ref={signatureRef}
                  canvasProps={{
                    width: 600,
                    height: 200,
                    className: 'signature-canvas'
                  }}
                  backgroundColor="white"
                />
              </Box>

              <Button
                variant="outlined"
                startIcon={<ClearAll />}
                onClick={() => {
                  signatureRef.current?.clear();
                  setSignature(null);
                }}
                sx={{ mb: 2 }}
              >
                Limpar Assinatura
              </Button>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Observações Adicionais"
                value={formData.notes}
                onChange={(e) => setFormData({
                  ...formData,
                  notes: e.target.value
                })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Custo Total"
                value={formData.cost}
                onChange={(e) => setFormData({
                  ...formData,
                  cost: e.target.value
                })}
                InputProps={{
                  startAdornment: 'R$'
                }}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/ordens-servico')}
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

export default ServiceOrderForm;