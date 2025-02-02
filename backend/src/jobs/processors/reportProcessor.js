const PDFService = require('../../services/PDFService');
const S3Service = require('../../services/S3Service');
const {Report} = require('../../models/Report');
const logger = require('../../utils/logger');

const reportProcessor = {
  async generate(type, filters, userId) {
    try {
      let report;
      let buffer;

      switch (type) {
        case 'maintenance':
          buffer = await PDFService.createMaintenanceReport(filters);
          break;
        case 'equipment':
          buffer = await PDFService.createEquipmentReport(filters);
          break;
        default:
          throw new Error(`Tipo de relatório não suportado: ${type}`);
      }

      // Upload do relatório para S3
      const fileName = `reports/${type}/${Date.now()}.pdf`;
      const uploadResult = await S3Service.uploadFile({
        buffer,
        originalname: fileName,
        mimetype: 'application/pdf'
      });

      // Atualiza status no banco
      report = await Report.create({
        type,
        filters,
        file_url: uploadResult.url,
        status: 'completed',
        created_by: userId
      });

      return report;

    } catch (error) {
      logger.error('Erro ao gerar relatório:', error);
      throw error;
    }
  }
};

module.exports = reportProcessor;