const PDFDocument = require('pdfkit');
const { format } = require('date-fns');
const ptBR = require('date-fns/locale/pt-BR');

class PDFService {
  createMaintenanceReport(equipment, maintenances) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument();
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));

        // Cabeçalho
        doc.fontSize(20).text('Relatório de Manutenções', { align: 'center' });
        doc.moveDown();

        // Informações do Equipamento
        doc.fontSize(16).text('Dados do Equipamento');
        doc.fontSize(12)
           .text(`Nome: ${equipment.name}`)
           .text(`Código: ${equipment.code}`)
           .text(`Departamento: ${equipment.department}`)
           .text(`Status: ${equipment.status}`);
        
        doc.moveDown();

        // Resumo
        const totalCost = maintenances.reduce((sum, m) => sum + (m.cost || 0), 0);
        doc.fontSize(16).text('Resumo');
        doc.fontSize(12)
           .text(`Total de Manutenções: ${maintenances.length}`)
           .text(`Custo Total: R$ ${totalCost.toFixed(2)}`);
        
        doc.moveDown();

        // Lista de Manutenções
        doc.fontSize(16).text('Histórico de Manutenções');
        doc.moveDown();

        maintenances.forEach(maintenance => {
          doc.fontSize(12)
             .text(`Data: ${format(new Date(maintenance.maintenance_date), 'dd/MM/yyyy')}`)
             .text(`Tipo: ${maintenance.type}`)
             .text(`Descrição: ${maintenance.description}`)
             .text(`Custo: R$ ${maintenance.cost?.toFixed(2) || '0,00'}`)
             .text(`Técnico: ${maintenance.technician?.name || 'Não informado'}`);
          
          if (maintenance.parts_replaced?.length > 0) {
            doc.text('Peças Substituídas:');
            maintenance.parts_replaced.forEach(part => {
              doc.text(`  - ${part.name}: ${part.quantity} unidade(s)`);
            });
          }

          doc.moveDown();
        });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  createEquipmentReport(equipments) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument();
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));

        // Cabeçalho
        doc.fontSize(20).text('Relatório de Equipamentos', { align: 'center' });
        doc.moveDown();

        // Resumo por Departamento
        const departmentSummary = equipments.reduce((acc, eq) => {
          acc[eq.department] = (acc[eq.department] || 0) + 1;
          return acc;
        }, {});

        doc.fontSize(16).text('Resumo por Departamento');
        Object.entries(departmentSummary).forEach(([dept, count]) => {
          doc.fontSize(12).text(`${dept}: ${count} equipamento(s)`);
        });
        
        doc.moveDown();

        // Lista de Equipamentos
        doc.fontSize(16).text('Lista de Equipamentos');
        doc.moveDown();

        equipments.forEach(equipment => {
          doc.fontSize(12)
             .text(`Nome: ${equipment.name}`)
             .text(`Código: ${equipment.code}`)
             .text(`Departamento: ${equipment.department}`)
             .text(`Status: ${equipment.status}`)
             .text(`Última Manutenção: ${equipment.last_maintenance ? 
               format(new Date(equipment.last_maintenance), 'dd/MM/yyyy') : 
               'Nunca realizada'}`);
          
          doc.moveDown();
        });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = new PDFService();