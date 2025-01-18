import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Search, Filter, Download } from 'lucide-react';

const EquipmentList = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    department: '',
    status: '',
    search: ''
  });

  const fetchEquipment = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`/api/equipment?${queryParams}`);
      const data = await response.json();
      setEquipment(data);
    } catch (error) {
      console.error('Erro ao buscar equipamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, [filters]);

  const handleExportPDF = async () => {
    try {
      const response = await fetch('/api/equipment/export/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(filters)
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'equipamentos.pdf';
      a.click();
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="bg-gray-50 p-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-xl font-bold">Equipamentos Cadastrados</h2>
          
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar equipamento..."
                className="pl-10 pr-4 py-2 border rounded-md"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>

            <select
              className="p-2 border rounded-md"
              value={filters.department}
              onChange={(e) => setFilters({...filters, department: e.target.value})}
            >
              <option value="">Todos os Departamentos</option>
              <option value="TI">TI</option>
              <option value="Produção">Produção</option>
              <option value="Manutenção">Manutenção</option>
            </select>

            <select
              className="p-2 border rounded-md"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="">Todos os Status</option>
              <option value="active">Ativo</option>
              <option value="maintenance">Em Manutenção</option>
              <option value="inactive">Inativo</option>
            </select>

            <button
              onClick={handleExportPDF}
              className="flex items-center px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {loading ? (
          <div className="text-center py-4">Carregando...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-4 text-left">Nome</th>
                  <th className="p-4 text-left">Código</th>
                  <th className="p-4 text-left">Departamento</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Última Manutenção</th>
                  <th className="p-4 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {equipment.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="p-4">{item.name}</td>
                    <td className="p-4">{item.code}</td>
                    <td className="p-4">{item.department}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        item.status === 'active' ? 'bg-green-100 text-green-800' :
                        item.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.status === 'active' ? 'Ativo' :
                         item.status === 'maintenance' ? 'Em Manutenção' :
                         'Inativo'}
                      </span>
                    </td>
                    <td className="p-4">
                      {item.last_maintenance ? 
                        new Date(item.last_maintenance).toLocaleDateString() :
                        'Nunca realizada'}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => window.location.href = `/equipment/${item.id}`}
                          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Detalhes
                        </button>
                        <button
                          onClick={() => window.location.href = `/equipment/${item.id}/maintenance`}
                          className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Manutenção
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EquipmentList;