const { Equipment, ServiceOrder, MaintenanceHistory } = require('../models');
const NotificationService = require('../services/notificationService');
const MediaService = require('../services/mediaService');
const ReportService = require('../services/reportService');
const { maintenanceHistorySchema } = require('../validations/schemas');

class MaintenanceController {
  async createServiceOrder(req, res) {
    const {
      equipment_id,
      description,
      type,
      priority,
      scheduled_for,
      notes
    } = req.body;

    const equipment = await Equipment.findByPk(equipment_id);
    if (!equipment) {
      return res.status(404).json({ error: 'Equipamento não encontrado' });
    }

    let serviceOrder;
    let uploadedFiles = [];

    try {
      // Upload de fotos
      if (req.files?.photos) {
        const photoPromises = req.files.photos.map(photo => 
          MediaService.uploadPhoto(photo)
        );
        const photos = await Promise.all(photoPromises);
        uploadedFiles.push(...photos);
      }

      // Upload de arquivos
      if (req.files?.attachments) {
        const filePromises = req.files.attachments.map(file =>
          MediaService.uploadFile(file)
        );
        const files = await Promise.all(filePromises);
        uploadedFiles.push(...files);
      }

      serviceOrder = await ServiceOrder.create({
        equipment_id,
        description,
        type,
        priority,
        scheduled_for,
        notes,
        created_by: req.userId,
        status: 'pending',
        photos: uploadedFiles.filter(f => f.type?.startsWith('image/')),
        attachments: uploadedFiles.filter(f => !f.type?.startsWith('image/'))
      });

      // Atualiza o status do equipamento
      await equipment.update({ status: 'maintenance' });

      // Envia notificações
      await NotificationService.sendMaintenanceNotification(
        serviceOrder,
        'maintenance_scheduled'
      );

      return res.status(201).json(serviceOrder);
    } catch (error) {
      // Em caso de erro, remove os arquivos já enviados
      if (uploadedFiles.length > 0) {
        await Promise.all(
          uploadedFiles.map(file => MediaService.deleteFile(file.key))
        );
      }
      throw error;
    }
  }

  async completeServiceOrder(req, res) {
    const { id } = req.params;
    const { notes, cost, parts_replaced } = req.body;

    const serviceOrder = await ServiceOrder.findByPk(id, {
      include: [{ model: Equipment, as: 'equipment' }]
    });

    if (!serviceOrder) {
      return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
    }

    await serviceOrder.update({
      status: 'completed',
      completed_at: new Date(),
      notes,
      cost,
      parts_replaced
    });

    // Registra no histórico
    await MaintenanceHistory.create({
      equipment_id: serviceOrder.equipment_id,
      maintenance_date: serviceOrder.completed_at,
      type: serviceOrder.type,
      description: serviceOrder.description,
      cost: serviceOrder.cost,
      parts_replaced: serviceOrder.parts_replaced,
      performed_by: req.userId
    });

    // Atualiza o equipamento
    await serviceOrder.equipment.update({
      status: 'active',
      last_maintenance: serviceOrder.completed_at
    });

    // Envia notificação
    await NotificationService.sendMaintenanceNotification(
      serviceOrder,
      'maintenance_complete'
    );

    return res.json(serviceOrder);
  }

  async generateReport(req, res) {
    const { start_date, end_date, format = 'pdf' } = req.query;

    const report = await ReportService.generateMaintenanceReport(
      new Date(start_date),
      new Date(end_date),
      format
    );

    res.setHeader('Content-Disposition', `attachment; filename=maintenance-report.${format}`);
    
    if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
    } else {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }

    return res.send(report);
  }

  async getEquipmentStats(req, res) {
    const stats = await Equipment.findAll({
      attributes: [
        'department',
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        [sequelize.fn('SUM', sequelize.col('maintenance_history.cost')), 'totalCost'],
        [sequelize.fn('COUNT', sequelize.col('maintenance_history.id')), 'maintenanceCount']
      ],
      include: [{
        model: MaintenanceHistory,
        as: 'maintenance_history',
        attributes: []
      }],
      group: ['department'],
      raw: true
    });

    return res.json(stats);
  }
}

module.exports = new MaintenanceController();