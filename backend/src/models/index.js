const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Criação da instância do Sequelize
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    define: dbConfig.define,
    logging: dbConfig.logging,
    pool: dbConfig.pool
  }
);

// Importação dos modelos
const User = require('./User');
const ServiceOrder = require('./ServiceOrder');
const MaintenanceHistory = require('./MaintenanceHistory');
const Notification = require('./Notification');
const File = require('./File');
const Equipment = require('./Equipment');
const Report = require('./Report');

// Inicialização dos modelos
const models = {
  User: User.init(sequelize),
  ServiceOrder: ServiceOrder.init(sequelize),
  MaintenanceHistory: MaintenanceHistory.init(sequelize),
  Notification: Notification.init(sequelize),
  File: File.init(sequelize),
  Equipment: Equipment.init(sequelize),
  Report: Report.init(sequelize)
};

// Associações entre modelos
Object.values(models)
  .filter(model => typeof model.associate === 'function')
  .forEach(model => model.associate(models));

module.exports = {
  sequelize,
  Sequelize,
  ...models
};