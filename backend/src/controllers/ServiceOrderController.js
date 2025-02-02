const {ServiceOrder} = require('../models/ServiceOrder');
const {File} = require('../models/File');
const {Equipment} = require('../models/Equipment');
const {MaintenanceHistory} = require('../models/MaintenanceHistory')
const {User} = require('../models/User');

const S3Service = require('../services/S3Service');

class ServiceOrderController {
  async store(req, res) {
    const {
      equipment_id,
      description,
      type,
      priority,
      scheduled_for,
    } = req.body;

    const equipment = await Equipment.findByPk(equipment_id);

    if (!equipment) {
      return res.status(404).json({ error: 'Equipamento não encontrado' });
    }

    const serviceOrder = await ServiceOrder.create({
      equipment_id,
      description,
      type,
      priority,
      scheduled_for,
      created_by: req.userId,
    });

    if (req.files) {
      const filesPromises = req.files.map(file => 
        S3Service.uploadToS3(file).then(url => 
          File.create({
            name: file.originalname,
            path: url,
            service_order_id: serviceOrder.id,
          })
        )
      );

      await Promise.all(filesPromises);
    }

    return res.status(201).json(serviceOrder);
  }

  async index(req, res) {
    const { status, equipment_id, date_start, date_end } = req.query;
    const where = {};

    if (status) where.status = status;
    if (equipment_id) where.equipment_id = equipment_id;
    if (date_start && date_end) {
      where.scheduled_for = {
        [Op.between]: [date_start, date_end],
      };
    }

    const serviceOrders = await ServiceOrder.findAll({
      where,
      include: [
        {
          model: Equipment,
          as: 'equipment',
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name'],
        },
        {
          model: User,
          as: 'technician',
          attributes: ['id', 'name'],
        },
        {
          model: File,
          as: 'files',
        },
      ],
      order: [['scheduled_for', 'ASC']],
    });

    return res.json(serviceOrders);
  }

  async update(req, res) {
    const serviceOrder = await ServiceOrder.findByPk(req.params.id);

    if (!serviceOrder) {
      return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
    }

    if (req.body.status === 'completed') {
      req.body.completed_at = new Date();

      await MaintenanceHistory.create({
        equipment_id: serviceOrder.equipment_id,
        maintenance_date: req.body.completed_at,
        type: serviceOrder.type,
        description: serviceOrder.description,
        performed_by: req.userId,
      });
    }

    await serviceOrder.update(req.body);

    return res.json(serviceOrder);
  }
}

module.exports = new ServiceOrderController();