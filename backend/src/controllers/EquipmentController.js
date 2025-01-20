const { Equipment, MaintenanceHistory } = require('../models');
const QRCode = require('qrcode');

class EquipmentController {
  async store(req, res) {
    const equipment = await Equipment.create(req.body);

    // Gera QR Code
    const qrcodeData = `${process.env.APP_URL}/equipment/${equipment.id}`;
    const qrcodeUrl = await QRCode.toDataURL(qrcodeData);
    
    await equipment.update({ qrcode_url: qrcodeUrl });

    return res.status(201).json(equipment);
  }

  async index(req, res) {
    const { department, status, search } = req.query;
    const where = {};

    if (department) where.department = department;
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { code: { [Op.iLike]: `%${search}%` } },
        { serial_number: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const equipment = await Equipment.findAll({
      where,
      include: [
        {
          model: MaintenanceHistory,
          as: 'maintenance_history',
          limit: 1,
          order: [['maintenance_date', 'DESC']],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    return res.json(equipment);
  }

  async show(req, res) {
    const equipment = await Equipment.findByPk(req.params.id, {
      include: [
        {
          model: MaintenanceHistory,
          as: 'maintenance_history',
          include: [
            {
              model: User,
              as: 'technician',
              attributes: ['id', 'name'],
            },
          ],
        },
        {
          model: ServiceOrder,
          as: 'service_orders',
          include: [
            {
              model: User,
              as: 'creator',
              attributes: ['id', 'name'],
            },
          ],
        },
      ],
    });

    if (!equipment) {
      return res.status(404).json({ error: 'Equipamento não encontrado' });
    }

    return res.json(equipment);
  }

  async update(req, res) {
    const equipment = await Equipment.findByPk(req.params.id);

    if (!equipment) {
      return res.status(404).json({ error: 'Equipamento não encontrado' });
    }

    await equipment.update(req.body);

    return res.json(equipment);
  }

  async destroy(req, res) {
    const equipment = await Equipment.findByPk(req.params.id);

    if (!equipment) {
      return res.status(404).json({ error: 'Equipamento não encontrado' });
    }

    await equipment.destroy();

    return res.status(204).send();
  }
}

module.exports = new EquipmentController();