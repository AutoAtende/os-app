const {Equipment} = require('../models/Equipment');
const {MaintenanceHistory} = require('../models/MaintenanceHistory')
const {User} = require('../models/User');
const {Notification} = require('../models/Notification');
const NotificationService = require('../services/NotificationService');
const WebSocketManager = require('../websocket/WebSocketManager');
const JobProcessor = require('../jobs/JobProcessor');
const logger = require('../utils/logger');

class NotificationController {
  async store(req, res) {
    try {
      const {
        type,
        title,
        message,
        recipient_id,
        reference_type,
        reference_id,
        priority = 'normal'
      } = req.body;

      // Cria notificação
      const notification = await Notification.create({
        type,
        title,
        message,
        recipient_id,
        reference_type,
        reference_id,
        priority,
        sender_id: req.userId
      });

      // Envia notificação em tempo real
      await NotificationService.send({
        notification,
        recipient_id
      });

      return res.status(201).json(notification);
    } catch (error) {
      logger.error('Erro ao criar notificação:', error);
      return res.status(500).json({ error: 'Erro ao criar notificação' });
    }
  }

  async list(req, res) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        read, 
        type,
        priority 
      } = req.query;

      const where = { recipient_id: req.userId };
      if (read !== undefined) where.read = read === 'true';
      if (type) where.type = type;
      if (priority) where.priority = priority;

      const notifications = await Notification.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'name']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: (page - 1) * limit
      });

      return res.json({
        items: notifications.rows,
        total: notifications.count,
        unread: await this.getUnreadCount(req.userId)
      });
    } catch (error) {
        logger.error('Erro ao listar notificações:', error);
        return res.status(500).json({ error: 'Erro ao listar notificações' });
      }
    }
  
    async markAsRead(req, res) {
      try {
        const { id } = req.params;
        const notification = await Notification.findOne({
          where: { 
            id,
            recipient_id: req.userId
          }
        });
  
        if (!notification) {
          return res.status(404).json({ error: 'Notificação não encontrada' });
        }
  
        await notification.update({ read: true });
  
        // Atualiza contadores em tempo real
        WebSocketManager.sendToClient(req.userId, {
          type: 'NOTIFICATION_READ',
          data: {
            notificationId: id,
            unreadCount: await this.getUnreadCount(req.userId)
          }
        });
  
        return res.json(notification);
      } catch (error) {
        logger.error('Erro ao marcar notificação como lida:', error);
        return res.status(500).json({ error: 'Erro ao atualizar notificação' });
      }
    }
  
    async markAllAsRead(req, res) {
      try {
        await Notification.update(
          { read: true },
          { 
            where: { 
              recipient_id: req.userId,
              read: false
            }
          }
        );
  
        // Atualiza contadores em tempo real
        WebSocketManager.sendToClient(req.userId, {
          type: 'ALL_NOTIFICATIONS_READ',
          data: { unreadCount: 0 }
        });
  
        return res.status(204).send();
      } catch (error) {
        logger.error('Erro ao marcar todas notificações como lidas:', error);
        return res.status(500).json({ error: 'Erro ao atualizar notificações' });
      }
    }
  
    async delete(req, res) {
      try {
        const { id } = req.params;
        const notification = await Notification.findOne({
          where: { 
            id,
            recipient_id: req.userId
          }
        });
  
        if (!notification) {
          return res.status(404).json({ error: 'Notificação não encontrada' });
        }
  
        await notification.destroy();
        return res.status(204).send();
      } catch (error) {
        logger.error('Erro ao deletar notificação:', error);
        return res.status(500).json({ error: 'Erro ao deletar notificação' });
      }
    }
  
    async getUnreadCount(userId) {
      return await Notification.count({
        where: {
          recipient_id: userId,
          read: false
        }
      });
    }
  
    async getUserPreferences(req, res) {
      try {
        const preferences = await NotificationPreference.findOne({
          where: { user_id: req.userId }
        });
  
        return res.json(preferences || {
          email: true,
          push: true,
          in_app: true,
          maintenance_reminders: true,
          equipment_alerts: true
        });
      } catch (error) {
        logger.error('Erro ao buscar preferências:', error);
        return res.status(500).json({ error: 'Erro ao buscar preferências' });
      }
    }
  
    async updateUserPreferences(req, res) {
      try {
        const {
          email,
          push,
          in_app,
          maintenance_reminders,
          equipment_alerts
        } = req.body;
  
        const [preferences] = await NotificationPreference.upsert({
          user_id: req.userId,
          email,
          push,
          in_app,
          maintenance_reminders,
          equipment_alerts
        });
  
        return res.json(preferences);
      } catch (error) {
        logger.error('Erro ao atualizar preferências:', error);
        return res.status(500).json({ error: 'Erro ao atualizar preferências' });
      }
    }
  
    // Métodos para envio de notificações específicas
    async notifyMaintenanceDue(equipment) {
      try {
        const users = await User.findAll({
          where: {
            [Op.or]: [
              { role: 'admin' },
              { role: 'technician', department: equipment.department }
            ]
          }
        });
  
        const notifications = users.map(user => ({
          type: 'MAINTENANCE_DUE',
          title: 'Manutenção Preventiva Necessária',
          message: `O equipamento ${equipment.name} (${equipment.code}) precisa de manutenção preventiva.`,
          recipient_id: user.id,
          reference_type: 'equipment',
          reference_id: equipment.id,
          priority: 'high'
        }));
  
        await Notification.bulkCreate(notifications);
  
        // Notifica em tempo real
        users.forEach(user => {
          WebSocketManager.sendToClient(user.id, {
            type: 'MAINTENANCE_DUE',
            data: { equipment }
          });
        });
  
        // Agenda envio de emails
        await JobProcessor.addNotificationJob('send_maintenance_due_emails', {
          equipment,
          users
        });
  
      } catch (error) {
        logger.error('Erro ao notificar manutenção necessária:', error);
      }
    }
  }
  
  module.exports = new NotificationController();