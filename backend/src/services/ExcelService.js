const ExcelJS = require('exceljs');
const logger = require('../utils/logger');

class ExcelService {
  async generateWorkbook() {
    return new ExcelJS.Workbook();
  }

  async generateMaintenanceReport(data) {
    try {
      const workbook = await this.generateWorkbook();
      const worksheet = workbook.addWorksheet('Manutenções');

      // Configuração das colunas
      worksheet.columns = [
        { header: 'Equipamento', key: 'equipment', width: 20 },
        { header: 'Código', key: 'code', width: 15 },
        { header: 'Tipo', key: 'type', width: 15 },
        { header: 'Data', key: 'date', width: 15 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Custo', key: 'cost', width: 15 },
        { header: 'Técnico', key: 'technician', width: 20 }
      ];

      // Estilização do cabeçalho
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };

      // Adiciona os dados
      data.forEach(item => {
        worksheet.addRow({
          equipment: item.equipment?.name,
          code: item.equipment?.code,
          type: item.type,
          date: item.maintenance_date,
          status: item.status,
          cost: item.cost,
          technician: item.technician?.name
        });
      });

      // Formatação da coluna de custo
      worksheet.getColumn('cost').numFmt = '"R$ "#,##0.00';

      return await workbook.xlsx.writeBuffer();
    } catch (error) {
      logger.error('Erro ao gerar relatório Excel:', error);
      throw new Error('Falha ao gerar relatório Excel');
    }
  }

  async generateEquipmentReport(data) {
    try {
      const workbook = await this.generateWorkbook();
      const worksheet = workbook.addWorksheet('Equipamentos');

      worksheet.columns = [
        { header: 'Nome', key: 'name', width: 20 },
        { header: 'Código', key: 'code', width: 15 },
        { header: 'Departamento', key: 'department', width: 20 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Última Manutenção', key: 'lastMaintenance', width: 20 },
        { header: 'Frequência (dias)', key: 'frequency', width: 15 }
      ];

      // Estilização do cabeçalho
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };

      // Adiciona os dados
      data.forEach(item => {
        worksheet.addRow({
          name: item.name,
          code: item.code,
          department: item.department,
          status: item.status,
          lastMaintenance: item.last_maintenance,
          frequency: item.maintenance_frequency
        });
      });

      return await workbook.xlsx.writeBuffer();
    } catch (error) {
      logger.error('Erro ao gerar relatório Excel:', error);
      throw new Error('Falha ao gerar relatório Excel');
    }
  }
}

module.exports = new ExcelService();