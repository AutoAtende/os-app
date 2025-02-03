require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes');
const { errorHandler } = require('./middlewares/errorHandler');
const db = require('./models');
const security = require('./middlewares/security');

const app = express();

// Middlewares básicos
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Aplicar middlewares de segurança
app.use(security.basic);
app.use('/api/auth', security.rateLimit.auth);
app.use('/api', security.rateLimit.all);

// Rotas
app.use('/api', routes);

// Tratamento de erros
app.use(errorHandler);

// Sincronização com o banco de dados
const syncDatabase = async () => {
  try {
    await db.sequelize.authenticate();
    console.log('Conexão com o banco estabelecida com sucesso.');

    if (process.env.NODE_ENV === 'development') {
      await db.sequelize.sync({ alter: true });
      console.log('Modelos sincronizados com o banco de dados.');
    }
  } catch (error) {
    console.error('Erro ao conectar com o banco:', error);
    process.exit(1);
  }
};

// Inicialização
const initializeApp = async () => {
  await syncDatabase();
  
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Ambiente: ${process.env.NODE_ENV}`);
  });
};

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  console.error('Erro não capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('Promise rejeitada não tratada:', error);
  process.exit(1);
});

if (require.main === module) {
  initializeApp();
}

module.exports = app;