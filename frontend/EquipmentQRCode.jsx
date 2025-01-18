import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Download, Printer } from 'lucide-react';

const EquipmentQRCode = ({ equipment }) => {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>QR Code - ${equipment.name}</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
            img { max-width: 300px; }
            .info { margin-top: 20px; }
          </style>
        </head>
        <body>
          <h2>${equipment.name}</h2>
          <img src="${equipment.qrcode_url}" alt="QR Code" />
          <div class="info">
            <p>Código: ${equipment.code}</p>
            <p>Departamento: ${equipment.department}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = equipment.qrcode_url;
    link.download = `qrcode-${equipment.code}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="bg-primary text-white p-4">
        <h2 className="text-xl font-bold">QR Code do Equipamento</h2>
      </CardHeader>

      <CardContent className="p-6 text-center">
        <div className="mb-4">
          <img
            src={equipment.qrcode_url}
            alt="QR Code"
            className="mx-auto max-w-[200px]"
          />
        </div>

        <div className="mb-4 text-sm">
          <p className="font-medium">{equipment.name}</p>
          <p className="text-gray-600">Código: {equipment.code}</p>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={handleDownload}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </button>
        </div>

        <p className="mt-4 text-sm text-gray-500">
          Escaneie este QR Code para acessar a página de manutenção do equipamento
        </p>
      </CardContent>
    </Card>
  );
};

export default EquipmentQRCode;