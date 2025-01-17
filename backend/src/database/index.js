const Sequelize = require('sequelize');
const config = require('../config/database');
const models = require('../models');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(dbConfig);

// Inicializa os models
Object.values(models).forEach(model => model.init(sequelize));

// Associações entre os models
Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});

module.exports = sequelize;