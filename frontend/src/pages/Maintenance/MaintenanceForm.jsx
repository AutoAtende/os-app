import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '@/services/api';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  ArrowLeft,
  Save,
  Camera,
  X,
  Plus,
  Loader2,
  Image as ImageIcon,
  FileText,
  Trash2
} from 'lucide-react';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  equipment_id: z.string().min(1, 'Equipamento é obrigatório'),
  description: z.string().min(10, 'Descrição deve ter no mínimo 10 caracteres'),
  type: z.enum(['corrective', 'preventive', 'predictive']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  scheduled_for: z.string().min(1, 'Data agendada é obrigatória'),
  notes: z.string().optional(),
  parts_replaced: z.array(z.object({
    name: z.string().min(1, 'Nome da peça é obrigatório'),
    quantity: z.number().min(1, 'Quantidade deve ser maior que 0'),
    cost: z.number().min(0, 'Custo não pode ser negativo')
  })).optional()
});

export default function MaintenanceForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [equipments, setEquipments] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [files, setFiles] = useState([]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      equipment_id: '',
      description: '',
      type: 'corrective',
      priority: 'medium',
      scheduled_for: new Date().toISOString().split('T')[0],
      notes: '',
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
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar equipamentos"
      });
    }
  };

  const loadMaintenance = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/maintenance/${id}`);
      form.reset({
        ...response.data,
        scheduled_for: new Date(response.data.scheduled_for).toISOString().split('T')[0]
      });
      
      if (response.data.photos) {
        setPhotos(response.data.photos.map(photo => ({
          preview: photo.url,
          id: photo.id
        })));
      }
      
      if (response.data.files) {
        setFiles(response.data.files);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar manutenção"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files);
    
    const validFiles = files.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: `Arquivo ${file.name} muito grande. Máximo: 5MB`
        });
        return false;
      }
      
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: `Tipo de arquivo não aceito: ${file.name}`
        });
        return false;
      }
      
      return true;
    });

    const newPhotos = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setPhotos(prev => [...prev, ...newPhotos]);
  };

  const handleFileUpload = async (event) => {
    const newFiles = Array.from(event.target.files);
    
    const validFiles = newFiles.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: `Arquivo ${file.name} muito grande. Máximo: 5MB`
        });
        return false;
      }
      return true;
    });

    setFiles(prev => [...prev, ...validFiles]);
  };

  const handleAddPart = () => {
    const currentParts = form.getValues('parts_replaced') || [];
    form.setValue('parts_replaced', [
      ...currentParts,
      { name: '', quantity: 1, cost: 0 }
    ]);
  };

  const handleRemovePart = (index) => {
    const currentParts = form.getValues('parts_replaced');
    const newParts = currentParts.filter((_, i) => i !== index);
    form.setValue('parts_replaced', newParts);
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
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
      photos.forEach((photo) => {
        if (photo.file) {
          formData.append('photos', photo.file);
        }
      });

      // Arquivos
      files.forEach((file) => {
        if (!file.id) {
          formData.append('files', file);
        }
      });

      if (id) {
        await api.put(`/maintenance/${id}`, formData);
        toast({
          title: "Sucesso",
          description: "Manutenção atualizada com sucesso"
        });
      } else {
        await api.post('/maintenance', formData);
        toast({
          title: "Sucesso",
          description: "Manutenção criada com sucesso"
        });
      }

      navigate('/manutencoes');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.response?.data?.error || "Erro ao salvar manutenção"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {id ? 'Editar Manutenção' : 'Nova Manutenção'}
          </h1>
          <p className="text-muted-foreground">
            {id ? 'Atualize os dados da manutenção' : 'Registre uma nova manutenção no sistema'}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/manutencoes')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridade</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a prioridade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Baixa</SelectItem>
                          <SelectItem value="medium">Média</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="critical">Crítica</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="scheduled_for"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data Agendada</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
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
                        placeholder="Descreva o problema ou serviço a ser realizado"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Peças Substituídas */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <FormLabel>Peças Substituídas</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddPart}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Peça
                  </Button>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome da Peça</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Custo Unitário</TableHead>
                        <TableHead className="w-[70px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {form.watch('parts_replaced')?.map((_, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`parts_replaced.${index}.name`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input {...field} placeholder="Nome da peça" />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`parts_replaced.${index}.quantity`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="1"
                                      {...field}
                                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`parts_replaced.${index}.cost`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      {...field}
                                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemovePart(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Fotos */}
              <div className="space-y-4">
                <FormLabel>Fotos</FormLabel>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={photo.preview}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2"
                        onClick={() => {
                          const newPhotos = [...photos];
                          newPhotos.splice(index, 1);
                          setPhotos(newPhotos);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                    <Camera className="h-8 w-8 text-muted-foreground" />
                    <span className="mt-2 text-sm text-muted-foreground">
                      Adicionar fotos
                    </span>
                  </label>
                </div>
              </div>

              {/* Arquivos */}
              <div className="space-y-4">
                <FormLabel>Arquivos Anexos</FormLabel>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm font-medium">{file.name}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newFiles = [...files];
                          newFiles.splice(index, 1);
                          setFiles(newFiles);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <label className="flex items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary">
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <div className="flex flex-col items-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      <span className="mt-2 text-sm text-muted-foreground">
                        Arraste arquivos ou clique para selecionar
                      </span>
                      <span className="mt-1 text-xs text-muted-foreground">
                        PDF, Word ou imagens até 5MB
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Observações */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações Adicionais</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={3}
                        placeholder="Informações adicionais sobre a manutenção"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Botões de Ação */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/manutencoes')}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? 'Salvando...' : 'Salvar Manutenção'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}