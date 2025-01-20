const ExcelJS = require('exceljs');
const { Equipment, Maintenance, User } = require('../models');
const { Op } = require('sequelize');

class ReportService {
  async generateMaintenanceReport(startDate, endDate, department = null) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Manutenções');

    // Define cabeçalhos
    worksheet.columns = [
      { header: 'Equipamento', key: 'equipment', width: 20 },
      { header: 'Código', key: 'code', width: 15 },
      { header: 'Departamento', key: 'department', width: 15 },
      { header: 'Tipo', key: 'type', width: 15 },
      { header: 'Data', key: 'date', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Técnico', key: 'technician', width: 20 },
      { header: 'Custo', key: 'cost', width: 15 }
    ];

    // Aplica estilo aos cabeçalhos
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Busca dados
    const query = {
      where: {
        created_at: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [
        {
          model: Equipment,
          ...(department && {
            where: { department }
          })
        },
        {
          model: User,
          as: 'technician',
          attributes: ['name']
        }
      ]
    };

    const maintenances = await Maintenance.findAll(query);

    // Adiciona dados
    maintenances.forEach(maintenance => {
      worksheet.addRow({
        equipment: maintenance.Equipment.name,
        code: maintenance.Equipment.code,
        department: maintenance.Equipment.department,
        type: maintenance.type,
        date: maintenance.maintenance_date.toLocaleDateString(),
        status: maintenance.status,
        technician: maintenance.technician?.name || 'N/A',
        cost: maintenance.cost || 0
      });
    });

    // Aplica formatação condicional para status
    worksheet.addConditionalFormatting({
      ref: 'F2:F1000',
      rules: [
        {
          type: 'cellIs',
          operator: 'equal',
          formulae: ['"completed"'],
          style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FF90EE90' } } }
        },
        {
          type: 'cellIs',
          operator: 'equal',
          formulae: ['"pending"'],
          style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFFFCCCB' } } }
        }
      ]
    });

    // Formata coluna de custo
    worksheet.getColumn('cost').numFmt = '"R$ "#,##0.00';

    // Adiciona totais
    const lastRow = worksheet.rowCount + 2;
    worksheet.addRow(['Total de Manutenções:', maintenances.length]);
    worksheet.addRow([
      'Custo Total:',
      {
        formula: `SUM(H2:H${worksheet.rowCount-2})`,
        numFmt: '"R$ "#,##0.00'
      }
    ]);

    // Retorna o buffer
    return await workbook.xlsx.writeBuffer();
  }

  async generateEquipmentReport() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Equipamentos');

    worksheet.columns = [
      { header: 'Nome', key: 'name', width: 20 },
      { header: 'Código', key: 'code', width: 15 },
      { header: 'Departamento', key: 'department', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Total Manutenções', key: 'maintenances', width: 18 },
      { header: 'Última Manutenção', key: 'lastMaintenance', width: 18 },
      { header: 'Custo Total', key: 'totalCost', width: 15 }
    ];

    const equipments = await Equipment.findAll({
      include: [{
        model: Maintenance,
        attributes: ['maintenance_date', 'cost']
      }]
    });

    equipments.forEach(equipment => {
      worksheet.addRow({
        name: equipment.name,
        code: equipment.code,
        department: equipment.department,
        status: equipment.status,
        maintenances: equipment.Maintenances.length,
        lastMaintenance: equipment.Maintenances.length ? 
          new Date(Math.max(...equipment.Maintenances.map(m => m.maintenance_date))).toLocaleDateString() : 
          'N/A',
        totalCost: equipment.Maintenances.reduce((sum, m) => sum + (m.cost || 0), 0)
      });
    });

    // Estilização e formatação
    worksheet.getRow(1).font = { bold: true };
    worksheet.getColumn('totalCost').numFmt = '"R$ "#,##0.00';

    return await workbook.xlsx.writeBuffer();
  }
}

module.exports = new ReportService();