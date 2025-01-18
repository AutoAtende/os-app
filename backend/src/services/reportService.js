const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const { Op } = require('sequelize');
const { Equipment, ServiceOrder, MaintenanceHistory } = require('../models');

class ReportService {
  async generateMaintenanceReport(startDate, endDate, format = 'pdf') {
    const data = await this.getMaintenanceData(startDate, endDate);
    
    return format === 'pdf' 
      ? await this.generatePDFReport(data)
      : await this.generateExcelReport(data);
  }

  async getMaintenanceData(startDate, endDate) {
    const equipment = await Equipment.findAll({
      include: [
        {
          model: ServiceOrder,
          as: 'service_orders',
          where: {
            created_at: {
              [Op.between]: [startDate, endDate]
            }
          },
          required: false
        },
        {
          model: MaintenanceHistory,
          as: 'maintenance_history',
          where: {
            maintenance_date: {
              [Op.between]: [startDate, endDate]
            }
          },
          required: false
        }
      ]
    });

    return equipment.map(eq => ({
      id: eq.id,
      name: eq.name,
      code: eq.code,
      department: eq.department,
      maintenanceCount: eq.maintenance_history.length,
      totalCost: eq.maintenance_history.reduce((sum, m) => sum + (m.cost || 0), 0),
      serviceOrders: eq.service_orders.length,
      lastMaintenance: eq.last_maintenance,
      status: eq.status
    }));
  }

  async generatePDFReport(data) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument();
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));

        // Cabeçalho
        doc.fontSize(20).text('Relatório de Manutenção de Equipamentos', {
          align: 'center'
        });
        doc.moveDown();

        // Sumário
        const totalEquipments = data.length;
        const totalMaintenances = data.reduce((sum, eq) => sum + eq.maintenanceCount, 0);
        const totalCost = data.reduce((sum, eq) => sum + eq.totalCost, 0);

        doc.fontSize(12).text(`Total de Equipamentos: ${totalEquipments}`);
        doc.text(`Total de Manutenções: ${totalMaintenances}`);
        doc.text(`Custo Total: R$ ${totalCost.toFixed(2)}`);
        doc.moveDown();

        // Detalhes por equipamento
        data.forEach(eq => {
          doc.text(`Equipamento: ${eq.name} (${eq.code})`);
          doc.text(`Departamento: ${eq.department}`);
          doc.text(`Manutenções: ${eq.maintenanceCount}`);
          doc.text(`Custo Total: R$ ${eq.totalCost.toFixed(2)}`);
          doc.text(`Status: ${eq.status}`);
          doc.moveDown();
        });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  async generateExcelReport(data) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Manutenções');

    worksheet.columns = [
      { header: 'Código', key: 'code', width: 15 },
      { header: 'Nome', key: 'name', width: 30 },
      { header: 'Departamento', key: 'department', width: 20 },
      { header: 'Qtd. Manutenções', key: 'maintenanceCount', width: 15 },
      { header: 'Custo Total', key: 'totalCost', width: 15 },
      { header: 'Ordens de Serviço', key: 'serviceOrders', width: 15 },
      { header: 'Última Manutenção', key: 'lastMaintenance', width: 20 },
      { header: 'Status', key: 'status', width: 15 }
    ];

    worksheet.addRows(data);

    return await workbook.xlsx.writeBuffer();
  }
}

module.exports = new ReportService();