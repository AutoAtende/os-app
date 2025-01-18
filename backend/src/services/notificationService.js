const { User, Equipment, ServiceOrder } = require('../models');
const nodemailer = require('nodemailer');
const { Expo } = require('expo-server-sdk');
const ejs = require('ejs');
const path = require('path');

class NotificationService {
  constructor() {
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    this.expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });
  }

  async sendMaintenanceNotification(serviceOrder, notificationType) {
    try {
      const equipment = await Equipment.findByPk(serviceOrder.equipment_id);
      const users = await this.getNotificationRecipients(serviceOrder);

      const notifications = users.map(user => 
        this.sendMultiChannelNotification({
          user,
          equipment,
          serviceOrder,
          type: notificationType
        })
      );

      await Promise.all(notifications);
    } catch (error) {
      console.error('Erro ao enviar notificações:', error);
      throw new Error('Falha ao enviar notificações');
    }
  }

  async getNotificationRecipients(serviceOrder) {
    const recipients = await User.findAll({
      where: {
        [Op.or]: [
          { role: ['admin', 'manager'] },
          { id: serviceOrder.assigned_to }
        ]
      }
    });

    return recipients;
  }

  async sendMultiChannelNotification({ user, equipment, serviceOrder, type }) {
    const notificationData = this.getNotificationContent(type, {
      userName: user.name,
      equipmentName: equipment.name,
      equipmentCode: equipment.code,
      serviceOrder
    });

    const promises = [];

    // Email
    if (user.email) {
      promises.push(
        this.sendEmailNotification(user.email, notificationData)
      );
    }

    // Push Notification
    if (user.pushToken) {
      promises.push(
        this.sendPushNotification(user.pushToken, notificationData)
      );
    }

    await Promise.all(promises);
  }

  getNotificationContent(type, data) {
    const templates = {
      maintenance_scheduled: {
        subject: `Manutenção Agendada - ${data.equipmentName}`,
        title: 'Nova Manutenção Agendada',
        template: 'maintenance-notification',
        priority: 'high'
      },
      maintenance_reminder: {
        subject: `Lembrete de Manutenção - ${data.equipmentName}`,
        title: 'Lembrete de Manutenção',
        template: 'maintenance-reminder',
        priority: 'normal'
      },
      maintenance_complete: {
        subject: `Manutenção Concluída - ${data.equipmentName}`,
        title: 'Manutenção Finalizada',
        template: 'maintenance-complete',
        priority: 'normal'
      },
      maintenance_overdue: {
        subject: `Manutenção Atrasada - ${data.equipmentName}`,
        title: 'Alerta de Manutenção Atrasada',
        template: 'maintenance-overdue',
        priority: 'high'
      }
    };

    return {
      ...templates[type],
      data
    };
  }

  async sendEmailNotification(email, notificationData) {
    const templatePath = path.join(__dirname, '../views/emails', `${notificationData.template}.ejs`);
    const html = await ejs.renderFile(templatePath, notificationData.data);

    return this.emailTransporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: notificationData.subject,
      html
    });
  }

  async sendPushNotification(pushToken, notificationData) {
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token inválido ${pushToken}`);
      return;
    }

    const message = {
      to: pushToken,
      sound: 'default',
      title: notificationData.title,
      body: this.generateNotificationBody(notificationData),
      data: notificationData.data,
      priority: notificationData.priority
    };

    try {
      await this.expo.sendPushNotificationsAsync([message]);
    } catch (error) {
      console.error('Erro ao enviar push notification:', error);
    }
  }

  generateNotificationBody(notificationData) {
    const { data } = notificationData;
    switch (notificationData.template) {
      case 'maintenance-notification':
        return `Manutenção agendada para ${data.equipmentName} (${data.equipmentCode}) em ${new Date(data.serviceOrder.scheduled_for).toLocaleDateString()}`;
      case 'maintenance-reminder':
        return `Lembrete: Manutenção programada para amanhã - ${data.equipmentName}`;
      case 'maintenance-complete':
        return `Manutenção finalizada em ${data.equipmentName}`;
      case 'maintenance-overdue':
        return `Atenção: Manutenção atrasada em ${data.equipmentName}`;
      default:
        return '';
    }
  }

  async checkUpcomingMaintenances() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const serviceOrders = await ServiceOrder.findAll({
      where: {
        scheduled_for: {
          [Op.gte]: new Date(),
          [Op.lt]: tomorrow
        },
        status: 'pending'
      },
      include: [
        {
          model: Equipment,
          as: 'equipment'
        }
      ]
    });

    for (const serviceOrder of serviceOrders) {
      await this.sendMaintenanceNotification(serviceOrder, 'maintenance_reminder');
    }
  }

  async checkOverdueMaintenances() {
    const today = new Date();
    
    const serviceOrders = await ServiceOrder.findAll({
      where: {
        scheduled_for: {
          [Op.lt]: today
        },
        status: 'pending'
      },
      include: [
        {
          model: Equipment,
          as: 'equipment'
        }
      ]
    });

    for (const serviceOrder of serviceOrders) {
      await this.sendMaintenanceNotification(serviceOrder, 'maintenance_overdue');
    }
  }
}

module.exports = new NotificationService();