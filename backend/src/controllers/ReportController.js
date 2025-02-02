const PDFService = require('../services/PDFService');
const ExcelService = require('../services/ExcelService');
const JobProcessor = require('../jobs/JobProcessor');
const CacheService = require('../services/CacheService');
const logger = require('../utils/logger');
const { Equipment, MaintenanceHistory, User } = require('../models');
const { Op } = require('sequelize');

class ReportController {
  async generate(req, res) {
    try {
      const {
        type,
        format = 'pdf',
        start_date,
        end_date,
        department,
        equipment_id
      } = req.query;

      if (!type) {
        return res.status(400).json({ error: 'Tipo de relatório é obrigatório' });
      }

      // Gera chave de cache
      const cacheKey = `report:${type}:${format}:${start_date}:${end_date}:${department}:${equipment_id}`;
      
      // Verifica cache
      const cachedReport = await CacheService.get(cacheKey);
      if (cachedReport) {
        return res.json(cachedReport);
      }

      // Define filtros base
      const where = {};
      if (start_date && end_date) {
        where.created_at = { [Op.between]: [start_date, end_date] };
      }
      if (department) {
        where.department = department;
      }
      if (equipment_id) {
        where.equipment_id = equipment_id;
      }

      let data;
      let buffer;

      // Busca dados baseado no tipo de relatório
      switch (type) {
        case 'maintenance':
          data = await MaintenanceHistory.findAll({
            where,
            include: [
              { model: Equipment, as: 'equipment' },
              { model: User, as: 'technician', attributes: ['name'] }
            ],
            order: [['created_at', 'DESC']]
          });
          buffer = format === 'pdf' ? 
            await PDFService.createMaintenanceReport(data) :
            await ExcelService.generateMaintenanceReport(data);
          break;

        case 'equipment':
          data = await Equipment.findAll({
            where,
            include: [{ model: MaintenanceHistory, as: 'maintenance_history' }],
            order: [['name', 'ASC']]
          });
          buffer = format === 'pdf' ? 
            await PDFService.createEquipmentReport(data) :
            await ExcelService.generateEquipmentReport(data);
          break;

        default:
          return res.status(400).json({ error: 'Tipo de relatório inválido' });
      }

      // Define headers baseado no formato
      res.setHeader('Content-Disposition', `attachment; filename=report-${type}.${format}`);
      if (format === 'pdf') {
        res.setHeader('Content-Type', 'application/pdf');
      } else {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      }

      return res.send(buffer);

    } catch (error) {
      logger.error('Erro ao gerar relatório:', error);
      return res.status(500).json({ error: 'Erro ao gerar relatório' });
    }
  }

  async getStatus(req, res) {
    try {
      const { jobId } = req.params;
      const status = await JobProcessor.getJobStatus(jobId);

      if (!status) {
        return res.status(404).json({ error: 'Job não encontrado' });
      }

      return res.json(status);
    } catch (error) {
      logger.error('Erro ao buscar status do relatório:', error);
      return res.status(500).json({ error: 'Erro ao buscar status' });
    }
  }

  async download(req, res) {
    try {
      const { reportId } = req.params;
      const { format = 'pdf' } = req.query;

      const report = await Report.findByPk(reportId);
      if (!report) {
        return res.status(404).json({ error: 'Relatório não encontrado' });
      }

      // Define headers baseado no formato
      if (format === 'pdf') {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=report-${reportId}.pdf`);
      } else {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=report-${reportId}.xlsx`);
      }

      const fileStream = await report.getFileStream();
      fileStream.pipe(res);

    } catch (error) {
      logger.error('Erro ao baixar relatório:', error);
      return res.status(500).json({ error: 'Erro ao baixar relatório' });
    }
  }

  async list(req, res) {
    try {
      const { page = 1, limit = 10, type } = req.query;

      const where = {};
      if (type) where.type = type;

      const reports = await Report.findAndCountAll({
        where,
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: (page - 1) * limit
      });

      return res.json({
        items: reports.rows,
        total: reports.count,
        page: parseInt(page),
        pages: Math.ceil(reports.count / limit)
      });

    } catch (error) {
      logger.error('Erro ao listar relatórios:', error);
      return res.status(500).json({ error: 'Erro ao listar relatórios' });
    }
  }

  async delete(req, res) {
    try {
      const report = await Report.findByPk(req.params.id);
      if (!report) {
        return res.status(404).json({ error: 'Relatório não encontrado' });
      }

      await report.deleteFile(); // Remove arquivo do S3
      await report.destroy();

      return res.status(204).send();
    } catch (error) {
      logger.error('Erro ao deletar relatório:', error);
      return res.status(500).json({ error: 'Erro ao deletar relatório' });
    }
  }
}

module.exports = new ReportController();