const { getRedisClient, isRedisAvailable } = require('../config/redis');
const logger = require('../utils/logger');

class CacheService {
  constructor() {
    this.prefix = 'oss:';
    this.defaultTTL = 3600; // 1 hora em segundos
  }

  async get(key) {
    try {
      // Verifica se o Redis está disponível
      if (!await isRedisAvailable()) {
        return null;
      }

      const redis = await getRedisClient();
      const value = await redis.get(this.prefix + key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.warn('Erro ao recuperar do cache:', error.message);
      return null;
    }
  }

  async set(key, value, ttl = this.defaultTTL) {
    try {
      // Verifica se o Redis está disponível
      if (!await isRedisAvailable()) {
        return false;
      }

      const redis = await getRedisClient();
      await redis.set(
        this.prefix + key,
        JSON.stringify(value),
        'EX',
        ttl
      );
      return true;
    } catch (error) {
      logger.warn('Erro ao definir cache:', error.message);
      return false;
    }
  }

  async delete(key) {
    try {
      // Verifica se o Redis está disponível
      if (!await isRedisAvailable()) {
        return false;
      }

      const redis = await getRedisClient();
      await redis.del(this.prefix + key);
      return true;
    } catch (error) {
      logger.warn('Erro ao deletar cache:', error.message);
      return false;
    }
  }

  async getOrSet(key, callback, ttl = this.defaultTTL) {
    let data = await this.get(key);
    
    if (!data) {
      data = await callback();
      if (data) {
        await this.set(key, data, ttl);
      }
    }

    return data;
  }
}

module.exports = new CacheService();