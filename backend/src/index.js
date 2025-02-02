require('dotenv').config();
const http = require('http');
const app = require('./app');
const WebSocket = require('ws');
const WebSocketManager = require('./websocket/WebSocketManager');
const logger = require('./utils/logger');
const { sequelize } = require('./models');

const server = http.createServer(app);
const wsManager = new WebSocketManager(server);

const startServer = async () => {
  try {
    // Testa conexão com banco
    await sequelize.authenticate();
    logger.info('Conexão com banco de dados estabelecida com sucesso.');

    // Sincroniza modelos com banco (em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('Modelos sincronizados com o banco de dados.');
    }

    const port = process.env.PORT || 3000;
    
    server.listen(port, () => {
      logger.info(`Servidor rodando na porta ${port}`);
      logger.info(`Ambiente: ${process.env.NODE_ENV}`);
    });

  } catch (error) {
    logger.error('Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  logger.error('Erro não capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  logger.error('Promise rejeitada não tratada:', error);
  process.exit(1);
});

startServer();