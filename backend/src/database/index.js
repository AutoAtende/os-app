const { sequelize } = require('../models'); // Importa os modelos já inicializados do `models/index.js`
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Caso queira garantir que a instância esteja corretamente configurada
if (!sequelize) {
  throw new Error('Falha ao conectar com o banco de dados.');
}

// Sincroniza o banco de dados com os modelos
sequelize.authenticate()
  .then(() => console.log('Conexão com o banco de dados estabelecida com sucesso!'))
  .catch(err => console.error('Não foi possível conectar ao banco de dados:', err));

module.exports = sequelize;
