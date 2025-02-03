require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const db = require('./models');

const app = express();

// Middlewares essenciais
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Rotas
app.use('/api', routes);

// Tratamento de erros (deve ser o último middleware)
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

if (require.main === module) {
  initializeApp();
}

module.exports = app;