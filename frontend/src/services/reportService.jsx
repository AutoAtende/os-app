import api from './api';

class ReportService {
  async generateMaintenanceReport(filters = {}, format = 'pdf') {
    try {
      const response = await api.get(`/reports/maintenance`, {
        params: { ...filters, format },
        responseType: 'blob'
      });

      const fileName = `maintenance-report-${new Date().toISOString().split('T')[0]}.${format}`;
      this.downloadFile(response.data, fileName, format);

      return true;
    } catch (error) {
      console.error('Erro ao gerar relatório de manutenção:', error);
      throw new Error('Não foi possível gerar o relatório');
    }
  }

  async generateEquipmentReport(filters = {}, format = 'pdf') {
    try {
      const response = await api.get(`/reports/equipment`, {
        params: { ...filters, format },
        responseType: 'blob'
      });

      const fileName = `equipment-report-${new Date().toISOString().split('T')[0]}.${format}`;
      this.downloadFile(response.data, fileName, format);

      return true;
    } catch (error) {
      console.error('Erro ao gerar relatório de equipamentos:', error);
      throw new Error('Não foi possível gerar o relatório');
    }
  }

  async generateServiceOrderReport(id, format = 'pdf') {
    try {
      const response = await api.get(`/reports/service-order/${id}`, {
        params: { format },
        responseType: 'blob'
      });

      const fileName = `service-order-${id}.${format}`;
      this.downloadFile(response.data, fileName, format);

      return true;
    } catch (error) {
      console.error('Erro ao gerar relatório da ordem de serviço:', error);
      throw new Error('Não foi possível gerar o relatório');
    }
  }

  async generateDashboardReport(period = 'month', format = 'pdf') {
    try {
      const response = await api.get(`/reports/dashboard`, {
        params: { period, format },
        responseType: 'blob'
      });

      const fileName = `dashboard-report-${period}-${new Date().toISOString().split('T')[0]}.${format}`;
      this.downloadFile(response.data, fileName, format);

      return true;
    } catch (error) {
      console.error('Erro ao gerar relatório do dashboard:', error);
      throw new Error('Não foi possível gerar o relatório');
    }
  }

  async exportEquipmentQRCodes(ids = [], format = 'pdf') {
    try {
      const response = await api.post(`/reports/qrcodes`, 
        { equipment_ids: ids },
        { 
          params: { format },
          responseType: 'blob' 
        }
      );

      const fileName = `equipment-qrcodes.${format}`;
      this.downloadFile(response.data, fileName, format);

      return true;
    } catch (error) {
      console.error('Erro ao exportar QR Codes:', error);
      throw new Error('Não foi possível exportar os QR Codes');
    }
  }

  async downloadFile(data, fileName, format) {
    const blob = new Blob([data], { 
      type: format === 'pdf' 
        ? 'application/pdf' 
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
}

export default new ReportService();