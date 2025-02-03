import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

import {
  PlusCircle,
  Search,
  Filter,
  MoreVertical,
  Edit,
  FileText,
  Calendar as CalendarIcon,
  ChevronDown,
  Loader2,
} from 'lucide-react';

const STATUS_COLORS = {
  pending: "warning",
  in_progress: "info",
  completed: "success",
  cancelled: "destructive"
};

const STATUS_LABELS = {
  pending: "Pendente",
  in_progress: "Em Andamento",
  completed: "Concluído",
  cancelled: "Cancelado"
};

const TYPE_LABELS = {
  corrective: "Corretiva",
  preventive: "Preventiva",
  predictive: "Preditiva"
};

export default function MaintenanceList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [maintenances, setMaintenances] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    type: '',
    dateRange: {
      from: null,
      to: null
    }
  });

  useEffect(() => {
    fetchMaintenances();
  }, [filters]);

  const fetchMaintenances = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        start_date: filters.dateRange.from?.toISOString(),
        end_date: filters.dateRange.to?.toISOString()
      };

      const response = await api.get('/maintenance', { params });
      setMaintenances(response.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar manutenções"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/maintenance/${id}/status`, { status: newStatus });
      toast({
        title: "Status atualizado",
        description: "Status da manutenção atualizado com sucesso"
      });
      fetchMaintenances();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao atualizar status"
      });
    }
  };

  const handleGenerateReport = async (id) => {
    try {
      const response = await api.get(`/maintenance/${id}/report`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `manutencao-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao gerar relatório"
      });
    }
  };

  const MaintenanceActions = ({ maintenance }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => navigate(`/manutencoes/${maintenance.id}/editar`)}>
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleGenerateReport(maintenance.id)}>
          <FileText className="mr-2 h-4 w-4" />
          Gerar Relatório
        </DropdownMenuItem>
        {maintenance.status !== 'completed' && (
          <DropdownMenuItem onClick={() => handleStatusChange(maintenance.id, 'completed')}>
            <FileText className="mr-2 h-4 w-4" />
            Marcar como Concluída
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manutenções</h1>
          <p className="text-muted-foreground">
            Gerencie as manutenções do sistema
          </p>
        </div>
        <Button onClick={() => navigate('/manutencoes/nova')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nova Manutenção
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          {/* Filtros */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Buscar manutenções..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  search: e.target.value
                }))}
                leftIcon={<Search className="h-4 w-4 text-muted-foreground" />}
              />
            </div>
            
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters(prev => ({
                ...prev,
                status: value
              }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="in_progress">Em Andamento</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.type}
              onValueChange={(value) => setFilters(prev => ({
                ...prev,
                type: value
              }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="corrective">Corretiva</SelectItem>
                <SelectItem value="preventive">Preventiva</SelectItem>
                <SelectItem value="predictive">Preditiva</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[240px] justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange.from ? (
                    filters.dateRange.to ? (
                      <>
                        {format(filters.dateRange.from, "P", { locale: ptBR })} -{" "}
                        {format(filters.dateRange.to, "P", { locale: ptBR })}
                      </>
                    ) : (
                      format(filters.dateRange.from, "P", { locale: ptBR })
                    )
                  ) : (
                    <span>Selecione o período</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={filters.dateRange}
                  onSelect={(range) => setFilters(prev => ({
                    ...prev,
                    dateRange: range || { from: null, to: null }
                  }))}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>

            <Button
              variant="outline"
              onClick={() => setFilters({
                search: '',
                status: '',
                type: '',
                dateRange: { from: null, to: null }
              })}
            >
              Limpar Filtros
            </Button>
          </div>

          {/* Lista de Manutenções */}
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipamento</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data Agendada</TableHead>
                    <TableHead>Técnico</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maintenances.map((maintenance) => (
                    <TableRow key={maintenance.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{maintenance.equipment.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {maintenance.equipment.code}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{TYPE_LABELS[maintenance.type]}</TableCell>
                      <TableCell>
                        <Badge variant={STATUS_COLORS[maintenance.status]}>
                          {STATUS_LABELS[maintenance.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(maintenance.scheduled_for), "PP", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        {maintenance.technician?.name || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            maintenance.priority === 'critical' ? 'destructive' :
                            maintenance.priority === 'high' ? 'warning' :
                            maintenance.priority === 'medium' ? 'default' :
                            'secondary'
                          }
                        >
                          {maintenance.priority === 'critical' ? 'Crítica' :
                           maintenance.priority === 'high' ? 'Alta' :
                           maintenance.priority === 'medium' ? 'Média' :
                           'Baixa'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <MaintenanceActions maintenance={maintenance} />
                      </TableCell>
                    </TableRow>
                  ))}
                  {maintenances.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center text-muted-foreground">
                          <FileText className="h-8 w-8 mb-2" />
                          <p>Nenhuma manutenção encontrada</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}