import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  Button,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Textarea,
  Alert,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui';
import {
  ArrowLeft,
  Save,
  Camera,
  Upload,
  X,
  Plus,
  Image
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '../services/api';

const formSchema = z.object({
  equipment_id: z.string().min(1, 'Equipamento é obrigatório'),
  description: z.string().min(10, 'Descrição deve ter no mínimo 10 caracteres'),
  type: z.enum(['corrective', 'preventive', 'predictive']),
  status: z.enum(['pending', 'in_progress', 'completed']),
  notes: z.string().optional(),
  cost: z.string().optional(),
  parts_replaced: z.array(z.object({
    name: z.string(),
    quantity: z.number(),
    cost: z.number()
  })).optional()
});

export default function MaintenanceForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [equipments, setEquipments] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [files, setFiles] = useState([]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      equipment_id: '',
      description: '',
      type: 'corrective',
      status: 'pending',
      notes: '',
      cost: '',
      parts_replaced: []
    }
  });

  useEffect(() => {
    fetchEquipments();
    if (id) {
      loadMaintenance();
    }
  }, [id]);

  const fetchEquipments = async () => {
    try {
      const response = await api.get('/equipment');
      setEquipments(response.data);
    } catch (error) {
      console.error('Erro ao buscar equipamentos:', error);
    }
  };

  const loadMaintenance = async () => {
    try {
      const response = await api.get(`/maintenance/${id}`);
      form.reset(response.data);
      if (response.data.photos) {
        setPhotos(response.data.photos.map(photo => ({
          id: photo.id,
          url: photo.url,
          preview: true
        })));
      }
      if (response.data.files) {
        setFiles(response.data.files);
      }
    } catch (error) {
      setError('Erro ao carregar manutenção');
    }
  };

  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files);
    
    setPhotos(prevPhotos => [
      ...prevPhotos,
      ...files.map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }))
    ]);
  };

  const handleFileUpload = (event) => {
    const uploadedFiles = Array.from(event.target.files);
    setFiles(prevFiles => [...prevFiles, ...uploadedFiles]);
  };

  const handleAddPart = () => {
    const parts = form.getValues('parts_replaced') || [];
    form.setValue('parts_replaced', [
      ...parts,
      { name: '', quantity: 1, cost: 0 }
    ]);
  };

  const handleRemovePart = (index) => {
    const parts = form.getValues('parts_replaced');
    parts.splice(index, 1);
    form.setValue('parts_replaced', parts);
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');

      const formData = new FormData();
      
      // Dados básicos
      Object.keys(data).forEach(key => {
        if (key === 'parts_replaced') {
          formData.append(key, JSON.stringify(data[key]));
        } else {
          formData.append(key, data[key]);
        }
      });

      // Fotos
      photos.forEach(photo => {
        if (!photo.preview) {
          formData.append('photos', photo.file);
        }
      });

      // Arquivos
      files.forEach(file => {
        if (!file.id) {
          formData.append('files', file);
        }
      });

      if (id) {
        await api.put(`/maintenance/${id}`, formData);
      } else {
        await api.post('/maintenance', formData);
      }

      navigate('/maintenance');
    } catch (error) {
      setError(error.response?.data?.error || 'Erro ao salvar manutenção');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900">
            {id ? 'Editar Manutenção' : 'Nova Manutenção'}
          </h1>
          <p className="text-gray-500">
            Registre os detalhes da manutenção
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/maintenance')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
      </div>

      <Card>
        <div className="p-6">
          {error && (
            <Alert variant="destructive" className="mb-6">
              {error}
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="equipment_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Equipamento</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um equipamento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {equipments.map(equipment => (
                          <SelectItem 
                            key={equipment.id} 
                            value={equipment.id.toString()}
                          >
                            {equipment.name} - {equipment.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="corrective">Corretiva</SelectItem>
                          <SelectItem value="preventive">Preventiva</SelectItem>
                          <SelectItem value="predictive">Preditiva</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pendente</SelectItem>
                          <SelectItem value="in_progress">Em Andamento</SelectItem>
                          <SelectItem value="completed">Concluída</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        rows={4}
                        placeholder="Descreva o problema ou serviço realizado"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormLabel>Fotos</FormLabel>
                <div className="grid grid-cols-4 gap-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={photo.preview || photo.url}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newPhotos = [...photos];
                          newPhotos.splice(index, 1);
                          setPhotos(newPhotos);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <Camera className="h-8 w-8 text-gray-400" />
                    <span className="mt-2 text-sm text-gray-500">
                      Adicionar fotos
                    </span>
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <FormLabel>Arquivos Anexos</FormLabel>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Image className="h-5 w-5 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {file.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newFiles = [...files];
                          newFiles.splice(index, 1);
                          setFiles(newFiles);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <label className="flex items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Upload className="h-6 w-6 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-500">
                      Adicionar arquivos
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={() => navigate('/maintenance')}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={loading}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </Card>
    </div>
  );
}