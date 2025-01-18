import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Camera, File, Calendar, Clock, Upload, Save } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import SignatureCanvas from 'react-signature-canvas';

const ServiceOrderForm = ({ equipmentId }) => {
  const [formData, setFormData] = useState({
    equipment_id: equipmentId,
    description: '',
    type: 'corrective',
    priority: 'medium',
    scheduled_for: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [files, setFiles] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [signatureRef, setSignatureRef] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [equipment, setEquipment] = useState(null);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const response = await fetch(`/api/equipment/${equipmentId}`);
        const data = await response.json();
        setEquipment(data);
      } catch (err) {
        setError('Erro ao carregar dados do equipamento');
      }
    };

    fetchEquipment();
  }, [equipmentId]);

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles([...files, ...newFiles]);
  };

  const handlePhotoChange = (e) => {
    const newPhotos = Array.from(e.target.files);
    setPhotos([...photos, ...newPhotos]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formPayload = new FormData();
    
    // Adiciona os dados do formulário
    Object.keys(formData).forEach(key => {
      formPayload.append(key, formData[key]);
    });

    // Adiciona as fotos
    photos.forEach(photo => {
      formPayload.append('photos', photo);
    });

    // Adiciona os arquivos
    files.forEach(file => {
      formPayload.append('files', file);
    });

    // Adiciona a assinatura se houver
    if (signatureRef) {
      const signatureData = signatureRef.toDataURL();
      formPayload.append('signature', signatureData);
    }

    try {
      const response = await fetch('/api/service-orders', {
        method: 'POST',
        body: formPayload
      });

      if (!response.ok) {
        throw new Error('Erro ao cadastrar ordem de serviço');
      }

      // Limpa o formulário após sucesso
      setFormData({
        equipment_id: equipmentId,
        description: '',
        type: 'corrective',
        priority: 'medium',
        scheduled_for: new Date().toISOString().split('T')[0],
        notes: ''
      });
      setFiles([]);
      setPhotos([]);
      if (signatureRef) signatureRef.clear();

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="bg-primary text-white p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Nova Ordem de Serviço</h2>
          {equipment && (
            <div className="text-sm">
              <p>Equipamento: {equipment.name}</p>
              <p>Código: {equipment.code}</p>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Descrição do Problema</label>
              <textarea
                className="w-full p-2 border rounded"
                rows="4"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tipo de Manutenção</label>
              <select
                className="w-full p-2 border rounded"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                required
              >
                <option value="corrective">Corretiva</option>
                <option value="preventive">Preventiva</option>
                <option value="predictive">Preditiva</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Prioridade</label>
              <select
                className="w-full p-2 border rounded"
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                required
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="critical">Crítica</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Data Agendada</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  className="w-full pl-10 p-2 border rounded"
                  value={formData.scheduled_for}
                  onChange={(e) => setFormData({...formData, scheduled_for: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Fotos</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded cursor-pointer hover:bg-blue-100">
                  <Camera className="w-4 h-4 mr-2" />
                  <span>Adicionar Fotos</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </label>
                <span className="text-sm text-gray-500">
                  {photos.length} foto(s) selecionada(s)
                </span>
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Arquivos Anexos</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center px-4 py-2 bg-green-50 text-green-600 rounded cursor-pointer hover:bg-green-100">
                  <File className="w-4 h-4 mr-2" />
                  <span>Anexar Arquivos</span>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
                <span className="text-sm text-gray-500">
                  {files.length} arquivo(s) anexado(s)
                </span>
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Assinatura</label>
              <div className="border rounded p-2">
                <SignatureCanvas
                  ref={(ref) => setSignatureRef(ref)}
                  canvasProps={{
                    className: 'w-full h-40 border rounded',
                    style: { backgroundColor: '#fff' }
                  }}
                />
                <button
                  type="button"
                  onClick={() => signatureRef && signatureRef.clear()}
                  className="mt-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  Limpar Assinatura
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-6 py-2 bg-primary text-white rounded hover:bg-primary-dark"
            >
              {loading ? (
                <span>Salvando...</span>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  <span>Registrar OS</span>
                </>
              )}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ServiceOrderForm;