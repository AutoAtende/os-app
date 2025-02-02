const EmailService = require('../../services/emailService');
const WebSocketManager = require('../../websocket/WebSocketManager');
const {Notification} = require('../../models/Notification');
const logger = require('../../utils/logger');

const notificationProcessor = {
  async send(type, data) {
    try {
      const notification = await Notification.create({
        type,
        ...data
      });

      // Envia email se configurado
      if (data.sendEmail) {
        await EmailService.sendMail({
          to: data.user.email,
          subject: data.subject,
          template: data.template,
          context: data.context
        });
      }

      // Notifica em tempo real
      WebSocketManager.sendToClient(data.userId, {
        type: 'NOTIFICATION',
        data: notification
      });

      return notification;

    } catch (error) {
      logger.error('Erro ao processar notificação:', error);
      throw error;
    }
  }
};

module.exports = notificationProcessor;