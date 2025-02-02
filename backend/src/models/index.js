const Sequelize = require('sequelize');
const config = require('../config/database');
const User = require('./User');
const Equipment = require('./Equipment');
const ServiceOrder = require('./ServiceOrder');
const MaintenanceHistory = require('./MaintenanceHistory');
const Notification = require('./Notification');
const File = require('./File');
const Report = require('./Report');

// Inicializa a conexão com o banco de dados
const env = process.env.NODE_ENV || 'development';
const sequelize = new Sequelize(config[env]);

// Define os modelos
const models = {
  User,
  Equipment,
  ServiceOrder,
  MaintenanceHistory,
  Notification,
  File,
  Report,
  sequelize,
  Sequelize
};

// Inicializa os modelos
Object.values(models)
  .filter(model => typeof model.init === 'function')
  .forEach(model => model.init(sequelize));

// Define as associações
Object.values(models)
  .filter(model => typeof model.associate === 'function')
  .forEach(model => model.associate(models));

module.exports = models;