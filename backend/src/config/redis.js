const Redis = require('ioredis');
const logger = require('../utils/logger');

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    if (times > 3) {
      return null; // Desiste após 3 tentativas
    }
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  lazyConnect: true // Não tenta conectar automaticamente
};

let redisClient = null;

const getRedisClient = async () => {
  if (!redisClient) {
    try {
      redisClient = new Redis(redisConfig);
      
      // Tenta conectar
      await redisClient.connect();
      
      redisClient.on('error', (error) => {
        logger.warn('Erro na conexão com Redis:', error);
      });

      redisClient.on('connect', () => {
        logger.info('Conectado ao Redis');
      });
    } catch (error) {
      logger.warn('Redis não disponível, sistema funcionará sem cache:', error.message);
      return null;
    }
  }
  return redisClient;
};

// Função para verificar se o Redis está disponível
const isRedisAvailable = async () => {
  const client = await getRedisClient();
  return client !== null;
};

module.exports = {
  getRedisClient,
  isRedisAvailable,
  redisConfig
};