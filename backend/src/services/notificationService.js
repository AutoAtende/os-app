class NotificationService {
    constructor(emailService) {
      this.emailService = emailService;
    }
  
    async notifyMaintenanceScheduled(serviceOrder) {
      const equipment = await Equipment.findByPk(serviceOrder.equipment_id);
      const users = await User.findAll({
        where: {
          role: ['admin', 'manager'],
        },
      });
  
      const notifications = users.map(user => 
        this.emailService.sendMaintenanceNotification({
          user,
          equipment,
          serviceOrder,
        })
      );
  
      await Promise.all(notifications);
    }
  
    async notifyMaintenanceComplete(serviceOrder) {
      const equipment = await Equipment.findByPk(serviceOrder.equipment_id);
      const users = await User.findAll({
        where: {
          role: ['admin', 'manager'],
        },
      });
  
      const notifications = users.map(user =>
        this.emailService.sendMaintenanceComplete({
          user,
          equipment,
          serviceOrder,
        })
      );
  
      await Promise.all(notifications);
    }
  
    async checkUpcomingMaintenance() {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
  
      const serviceOrders = await ServiceOrder.findAll({
        where: {
          scheduled_for: {
            [Op.gte]: new Date(),
            [Op.lt]: tomorrow,
          },
          status: 'pending',
        },
        include: [
          {
            model: Equipment,
            as: 'equipment',
          },
          {
            model: User,
            as: 'technician',
          },
        ],
      });
  
      for (const serviceOrder of serviceOrders) {
        await this.emailService.sendMaintenanceNotification({
          user: serviceOrder.technician,
          equipment: serviceOrder.equipment,
          serviceOrder,
        });
      }
    }
  }
  
  module.exports = {
    fileService: new FileService(),
    emailService: new EmailService(),
    notificationService: new NotificationService(new EmailService()),
  };