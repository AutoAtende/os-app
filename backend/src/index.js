require('dotenv').config();
const app = require('./app'); // Importa a aplicação configurada
const logger = require('./utils/logger');
const { sequelize } = require('./models');

const startServer = async () => {
  try {
    // Conecta ao banco de dados
    await sequelize.authenticate();
    logger.info('Conexão com banco de dados estabelecida.');

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      logger.info(`Servidor rodando na porta ${port}`);
      logger.info(`Ambiente: ${process.env.NODE_ENV}`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      logger.info('Iniciando shutdown graceful...');
      
      // Fecha conexões
      await sequelize.close();
      logger.info('Conexões com banco fechadas');

      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    logger.error('Erro fatal ao iniciar aplicação:', error);
    process.exit(1);
  }
};

startServer();