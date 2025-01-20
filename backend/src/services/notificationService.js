const AWS = require('aws-sdk');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const { Equipment, Maintenance, User } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class NotificationService {
  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION
    });

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Inicia os jobs de verificação
    this.initializeJobs();
  }

  initializeJobs() {
    // Verifica manutenções pendentes diariamente às 8h
    cron.schedule('0 8 * * *', () => {
      this.checkPendingMaintenances();
    });

    // Verifica equipamentos com manutenções frequentes semanalmente
    cron.schedule('0 9 * * 1', () => {
      this.checkFrequentMaintenances();
    });
  }

  async uploadFile(file, folder = 'general') {
    try {
      const fileName = `${folder}/${Date.now()}-${file.originalname}`;
      
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read'
      };

      const result = await this.s3.upload(params).promise();
      return result.Location;
    } catch (error) {
      logger.error('Erro no upload para S3:', error);
      throw new Error('Falha no upload do arquivo');
    }
  }

  async deleteFile(fileUrl) {
    try {
      const key = fileUrl.split(`${process.env.AWS_BUCKET_NAME}/`)[1];
      
      await this.s3.deleteObject({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key
      }).promise();
      
      return true;
    } catch (error) {
      logger.error('Erro ao deletar arquivo do S3:', error);
      throw new Error('Falha ao deletar arquivo');
    }
  }

  async checkPendingMaintenances() {
    try {
      const today = new Date();
      const maintenances = await Maintenance.findAll({
        where: {
          status: 'pending',
          scheduled_for: {
            [Op.lte]: today
          }
        },
        include: [
          {
            model: Equipment,
            attributes: ['name', 'code', 'department']
          }
        ]
      });

      if (maintenances.length > 0) {
        // Busca administradores
        const admins = await User.findAll({
          where: { role: 'admin' }
        });

        // Envia notificações
        for (const admin of admins) {
          await this.sendPendingMaintenanceEmail(admin, maintenances);
        }
      }
    } catch (error) {
      logger.error('Erro ao verificar manutenções pendentes:', error);
    }
  }

  async checkFrequentMaintenances() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Busca equipamentos com mais de 3 manutenções nos últimos 30 dias
      const equipments = await Equipment.findAll({
        include: [{
          model: Maintenance,
          where: {
            created_at: {
              [Op.gte]: thirtyDaysAgo
            }
          }
        }],
        having: sequelize.literal('COUNT(Maintenances.id) > 3'),
        group: ['Equipment.id']
      });

      if (equipments.length > 0) {
        const admins = await User.findAll({ where: { role: 'admin' } });
        for (const admin of admins) {
          await this.sendFrequentMaintenanceAlert(admin, equipments);
        }
      }
    } catch (error) {
      logger.error('Erro ao verificar manutenções frequentes:', error);
    }
  }

  async sendPendingMaintenanceEmail(user, maintenances) {
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: user.email,
      subject: 'Manutenções Pendentes - Atenção Necessária',
      html: `
        <h2>Manutenções Pendentes</h2>
        <p>As seguintes manutenções estão pendentes e requerem atenção:</p>
        <ul>
          ${maintenances.map(m => `
            <li>
              <strong>${m.Equipment.name}</strong> (${m.Equipment.code})<br>
              Departamento: ${m.Equipment.department}<br>
              Agendado para: ${m.scheduled_for.toLocaleDateString()}
            </li>
          `).join('')}
        </ul>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendFrequentMaintenanceAlert(user, equipments) {
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: user.email,
      subject: 'Alerta - Equipamentos com Manutenções Frequentes',
      html: `
        <h2>Equipamentos com Manutenções Frequentes</h2>
        <p>Os seguintes equipamentos apresentaram mais de 3 manutenções nos últimos 30 dias:</p>
        <ul>
          ${equipments.map(e => `
            <li>
              <strong>${e.name}</strong> (${e.code})<br>
              Departamento: ${e.department}<br>
              Total de manutenções: ${e.Maintenances.length}
            </li>
          `).join('')}
        </ul>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }
}

module.exports = new NotificationService();