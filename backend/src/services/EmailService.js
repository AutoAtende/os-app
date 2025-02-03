const nodemailer = require('nodemailer');
const path = require('path');
const ejs = require('ejs');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    this.templatesPath = path.resolve(__dirname, '..', 'views', 'emails');
  }

  async sendMail({ to, subject, template, context }) {
    const templatePath = path.join(this.templatesPath, `${template}.ejs`);
    
    const html = await ejs.renderFile(templatePath, context);

    return this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
    });
  }

  async sendMaintenanceNotification({ user, equipment, serviceOrder }) {
    return this.sendMail({
      to: user.email,
      subject: `Manutenção Agendada - ${equipment.name}`,
      template: 'maintenance-notification',
      context: {
        userName: user.name,
        equipmentName: equipment.name,
        equipmentCode: equipment.code,
        maintenanceDate: serviceOrder.scheduled_for,
        maintenanceType: serviceOrder.type,
        description: serviceOrder.description,
      },
    });
  }

  async sendMaintenanceComplete({ user, equipment, serviceOrder }) {
    return this.sendMail({
      to: user.email,
      subject: `Manutenção Concluída - ${equipment.name}`,
      template: 'maintenance-complete',
      context: {
        userName: user.name,
        equipmentName: equipment.name,
        equipmentCode: equipment.code,
        completedDate: serviceOrder.completed_at,
        maintenanceType: serviceOrder.type,
        description: serviceOrder.description,
      },
    });
  }
}

module.exports = new EmailService();