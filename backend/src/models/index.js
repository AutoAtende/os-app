const User = require('./User');
const Equipment = require('./Equipment');
const ServiceOrder = require('./ServiceOrder');
const MaintenanceHistory = require('./MaintenanceHistory');
const Notification = require('./Notification');
const File = require('./File');
const Report = require('./Report');

const models = {
  User: User,
  Equipment: Equipment,
  ServiceOrder: ServiceOrder,
  MaintenanceHistory: MaintenanceHistory,
  Notification: Notification,
  File: File,
  Report: Report
};

// Inicializa os modelos
Object.values(models).forEach(model => {
  if (model.init) {
    model.init(sequelize);
  }
});

// Define as associações
Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});

module.exports = {
  sequelize,
  Sequelize,
  ...models
};