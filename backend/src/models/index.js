const Sequelize = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(dbConfig);

// Importação dos modelos
const Equipment = require('./Equipment');
const File = require('./File');
const User = require('./User');
const Notification = require('./Notification');
const MaintenanceHistory = require('./MaintenanceHistory');
const ServiceOrder = require('./ServiceOrder');

// Inicialização dos modelos
const models = {
  Equipment: Equipment.init(sequelize),
  File: File.init(sequelize),
  User: User.init(sequelize),
  Notification: Notification.init(sequelize),
  MaintenanceHistory: MaintenanceHistory.init(sequelize),
  ServiceOrder: ServiceOrder.init(sequelize),
};

// Configuração das associações, caso existam
Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});

module.exports = { sequelize, ...models };
