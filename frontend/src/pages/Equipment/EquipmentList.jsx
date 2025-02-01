import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

import {
  PlusCircle,
  Search,
  Filter,
  MoreVertical,
  Edit,
  QrCode,
  Trash2,
  Download,
  Loader2
} from 'lucide-react';

const STATUS_COLORS = {
  active: "success",
  maintenance: "warning",
  inactive: "destructive"
};

const STATUS_LABELS = {
  active: "Ativo",
  maintenance: "Em Manutenção",
  inactive: "Inativo"
};

export default function EquipmentList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [equipments, setEquipments] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    department: '',
    status: ''
  });
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);

  useEffect(() => {
    fetchEquipments();
  }, [filters]);

  const fetchEquipments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/equipment', { params: filters });
      setEquipments(response.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar equipamentos"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/equipment/${id}`);
      toast({
        title: "Sucesso",
        description: "Equipamento excluído com sucesso"
      });
      fetchEquipments();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao excluir equipamento"
      });
    }
  };

  const handleExportQRCode = async (id) => {
    try {
      const response = await api.get(`/equipment/${id}/qrcode`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `qrcode-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao exportar QR Code"
      });
    }
  };

  const EquipmentActions = ({ equipment }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => navigate(`/equipamentos/${equipment.id}/editar`)}>
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExportQRCode(equipment.id)}>
          <QrCode className="mr-2 h-4 w-4" />
          QR Code
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-red-600"
          onClick={() => handleDelete(equipment.id)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Equipamentos</h1>
          <p className="text-muted-foreground">
            Gerencie os equipamentos cadastrados no sistema
          </p>
        </div>
        <Button onClick={() => navigate('/equipamentos/novo')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Equipamento
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Buscar equipamentos..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                leftIcon={<Search className="h-4 w-4 text-muted-foreground" />}
              />
            </div>
            <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtros
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Filtros</DialogTitle>
                  <DialogDescription>
                    Aplique filtros para refinar sua busca
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Departamento</label>
                    <Select
                      value={filters.department}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, department: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os departamentos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos</SelectItem>
                        <SelectItem value="TI">TI</SelectItem>
                        <SelectItem value="Produção">Produção</SelectItem>
                        <SelectItem value="Manutenção">Manutenção</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select
                      value={filters.status}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos</SelectItem>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="maintenance">Em Manutenção</SelectItem>
                        <SelectItem value="inactive">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFilters({ search: '', department: '', status: '' });
                      setFilterDialogOpen(false);
                    }}
                  >
                    Limpar Filtros
                  </Button>
                  <Button onClick={() => setFilterDialogOpen(false)}>
                    Aplicar Filtros
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={() => window.open('/api/equipment/export', '_blank')}>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Última Manutenção</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {equipments.map((equipment) => (
                    <TableRow key={equipment.id}>
                      <TableCell className="font-medium">{equipment.name}</TableCell>
                      <TableCell>{equipment.code}</TableCell>
                      <TableCell>{equipment.department}</TableCell>
                      <TableCell>
                        <Badge variant={STATUS_COLORS[equipment.status]}>
                          {STATUS_LABELS[equipment.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {equipment.last_maintenance
                          ? new Date(equipment.last_maintenance).toLocaleDateString()
                          : 'Nunca realizada'}
                      </TableCell>
                      <TableCell className="text-right">
                        <EquipmentActions equipment={equipment} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}