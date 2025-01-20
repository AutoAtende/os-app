const { Maintenance, Equipment, User } = require('../models');
const NotificationService = require('../services/NotificationService');
const S3Service = require('../services/S3Service');
const { maintenanceHistorySchema } = require('../validations/schemas');
const logger = require('../utils/logger');

class MaintenanceController {
  async store(req, res) {
    try {
      const {
        equipment_id,
        description,
        type,
        notes,
        cost
      } = req.body;

      // Valida equipamento
      const equipment = await Equipment.findByPk(equipment_id);
      if (!equipment) {
        return res.status(404).json({ error: 'Equipamento não encontrado' });
      }

      // Processa fotos
      let photoUrls = [];
      if (req.files?.photos) {
        const uploadPromises = req.files.photos.map(photo => 
          S3Service.uploadFile(photo, 'maintenance-photos')
        );
        photoUrls = await Promise.all(uploadPromises);
      }

      // Processa documentos
      let documentUrls = [];
      if (req.files?.documents) {
        const uploadPromises = req.files.documents.map(doc => 
          S3Service.uploadFile(doc, 'maintenance-documents')
        );
        documentUrls = await Promise.all(uploadPromises);
      }

      // Cria registro de manutenção
      const maintenance = await Maintenance.create({
        equipment_id,
        description,
        type,
        status: 'pending',
        notes,
        cost: cost || 0,
        photos: photoUrls,
        documents: documentUrls,
        created_by: req.userId
      });

      // Atualiza status do equipamento
      await equipment.update({ 
        status: 'maintenance',
        last_maintenance: new Date()
      });

      // Notifica responsáveis
      await NotificationService.notifyMaintenanceCreated(maintenance);

      return res.status(201).json(maintenance);

    } catch (error) {
      logger.error('Erro ao criar manutenção:', error);
      return res.status(500).json({ error: 'Erro ao registrar manutenção' });
    }
  }

  async index(req, res) {
    try {
      const { 
        status,
        equipment_id,
        start_date,
        end_date,
        type
      } = req.query;

      const where = {};

      if (status) where.status = status;
      if (equipment_id) where.equipment_id = equipment_id;
      if (type) where.type = type;
      
      if (start_date && end_date) {
        where.created_at = {
          [Op.between]: [start_date, end_date]
        };
      }

      // Se não for admin, filtra por departamento
      if (req.userRole !== 'admin') {
        const user = await User.findByPk(req.userId);
        where['$Equipment.department$'] = user.department;
      }

      const maintenances = await Maintenance.findAll({
        where,
        include: [
          {
            model: Equipment,
            attributes: ['id', 'name', 'code', 'department']
          },
          {
            model: User,
            as: 'technician',
            attributes: ['id', 'name']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      return res.json(maintenances);

    } catch (error) {
      logger.error('Erro ao listar manutenções:', error);
      return res.status(500).json({ error: 'Erro ao listar manutenções' });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const {
        status,
        notes,
        cost,
        completion_notes
      } = req.body;

      const maintenance = await Maintenance.findByPk(id, {
        include: [{ model: Equipment }]
      });

      if (!maintenance) {
        return res.status(404).json({ error: 'Manutenção não encontrada' });
      }

      // Se estiver completando a manutenção
      if (status === 'completed' && maintenance.status !== 'completed') {
        // Atualiza status do equipamento
        await maintenance.Equipment.update({ status: 'active' });
        
        // Notifica sobre conclusão
        await NotificationService.notifyMaintenanceCompleted(maintenance);
      }

      await maintenance.update({
        status,
        notes,
        cost,
        completion_notes,
        completed_at: status === 'completed' ? new Date() : null,
        completed_by: status === 'completed' ? req.userId : null
      });

      return res.json(maintenance);

    } catch (error) {
      logger.error('Erro ao atualizar manutenção:', error);
      return res.status(500).json({ error: 'Erro ao atualizar manutenção' });
    }
  }

  async show(req, res) {
    try {
      const { id } = req.params;

      const maintenance = await Maintenance.findByPk(id, {
        include: [
          {
            model: Equipment,
            attributes: ['id', 'name', 'code', 'department']
          },
          {
            model: User,
            as: 'technician',
            attributes: ['id', 'name']
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name']
          }
        ]
      });

      if (!maintenance) {
        return res.status(404).json({ error: 'Manutenção não encontrada' });
      }

      return res.json(maintenance);

    } catch (error) {
      logger.error('Erro ao buscar manutenção:', error);
      return res.status(500).json({ error: 'Erro ao buscar manutenção' });
    }
  }
}

module.exports = new MaintenanceController();