const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Criação da instância do Sequelize com configuração explícita do dialeto
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect, // Isso é importante!
    define: dbConfig.define,
    logging: dbConfig.logging,
    pool: dbConfig.pool
  }
);

const User = require('./User')(sequelize);
const ServiceOrder = require('./ServiceOrder')(sequelize);
const MaintenanceHistory = require('./MaintenanceHistory')(sequelize);
const Notification = require('./Notification')(sequelize);
const File = require('./File')(sequelize);
const Equipment = require('./Equipment')(sequelize);
const Report = require('./Report')(sequelize);

const models = { 
  User, 
  ServiceOrder, 
  MaintenanceHistory, 
  Notification, 
  File, 
  Equipment, 
  Report 
};

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