import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AlertCircle, Save, Upload } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const EquipmentForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    serial_number: '',
    department: '',
    description: '',
    maintenance_frequency: 30,
    status: 'active'
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/equipment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Erro ao cadastrar equipamento');
      }

      // Limpa o formulário após sucesso
      setFormData({
        name: '',
        code: '',
        serial_number: '',
        department: '',
        description: '',
        maintenance_frequency: 30,
        status: 'active'
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="bg-primary text-white p-4">
        <h2 className="text-xl font-bold">Cadastro de Equipamento</h2>
      </CardHeader>
      <CardContent className="p-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome do Equipamento</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Código Interno</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Número de Série</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={formData.serial_number}
                onChange={(e) => setFormData({...formData, serial_number: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Departamento</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Descrição</label>
              <textarea
                className="w-full p-2 border rounded"
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Frequência de Manutenção (dias)</label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={formData.maintenance_frequency}
                onChange={(e) => setFormData({...formData, maintenance_frequency: parseInt(e.target.value)})}
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                className="w-full p-2 border rounded"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                required
              >
                <option value="active">Ativo</option>
                <option value="maintenance">Em Manutenção</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
            >
              {loading ? (
                <span>Salvando...</span>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  <span>Salvar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EquipmentForm;