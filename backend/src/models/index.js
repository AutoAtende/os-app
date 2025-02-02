const { Sequelize } = require('sequelize');
const dbConfig = require('../config/database');

const sequelize = new Sequelize(dbConfig);

const User = require('./User')(sequelize);
const ServiceOrder = require('./ServiceOrder')(sequelize);
const MaintenanceHistory = require('./MaintenanceHistory')(sequelize);
const Notification = require('./Notification')(sequelize);
const File = require('./File')(sequelize);
const Equipment = require('./Equipment')(sequelize);
const Report = require('./Report')(sequelize);

const models = { User, ServiceOrder, MaintenanceHistory, Notification, File, Equipment, Report };

Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});

module.exports = { sequelize, Sequelize, ...models };
