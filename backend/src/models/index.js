const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const config = require('../config/database');

const db = {};
const sequelize = new Sequelize(config[process.env.NODE_ENV || 'development']);

// Carrega todos os modelos automaticamente
const modelsPath = __dirname;
fs.readdirSync(modelsPath)
  .filter(file => {
    return (file.indexOf('.') !== 0) && 
           (file !== path.basename(__filename)) && 
           (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const modelDefinition = require(path.join(modelsPath, file));
    const model = modelDefinition(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;