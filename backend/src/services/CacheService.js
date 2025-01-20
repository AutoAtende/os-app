const { getRedisClient } = require('../config/redis');
const logger = require('../utils/logger');

class CacheService {
  constructor() {
    this.redis = getRedisClient();
    this.defaultTTL = 3600; // 1 hora em segundos
  }

  async get(key) {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Erro ao recuperar do cache:', { key, error: error.message });
      return null;
    }
  }

  async set(key, value, ttl = this.defaultTTL) {
    try {
      await this.redis.set(
        key,
        JSON.stringify(value),
        'EX',
        ttl
      );
      return true;
    } catch (error) {
      logger.error('Erro ao definir cache:', { key, error: error.message });
      return false;
    }
  }

  async delete(key) {
    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      logger.error('Erro ao deletar cache:', { key, error: error.message });
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

  async invalidatePattern(pattern) {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(keys);
      }
      return true;
    } catch (error) {
      logger.error('Erro ao invalidar padrão de cache:', { pattern, error: error.message });
      return false;
    }
  }

  generateKey(...args) {
    return args.join(':');
  }

  // Cache específico para equipamentos
  async getEquipmentCache(id) {
    return this.get(`equipment:${id}`);
  }

  async setEquipmentCache(id, data) {
    return this.set(`equipment:${id}`, data);
  }

  async invalidateEquipmentCache(id) {
    return this.delete(`equipment:${id}`);
  }

  // Cache para listagens com paginação
  async getListCache(entity, page, limit, filters = {}) {
    const filterString = JSON.stringify(filters);
    const key = this.generateKey(entity, 'list', page, limit, filterString);
    return this.get(key);
  }

  async setListCache(entity, page, limit, filters = {}, data) {
    const filterString = JSON.stringify(filters);
    const key = this.generateKey(entity, 'list', page, limit, filterString);
    return this.set(key, data, 300); // 5 minutos para listas
  }

  // Cache para dashboards
  async getDashboardCache(userId) {
    return this.get(`dashboard:${userId}`);
  }

  async setDashboardCache(userId, data) {
    return this.set(`dashboard:${userId}`, data, 900); // 15 minutos para dashboard
  }

  async clearAllCache() {
    try {
      await this.redis.flushall();
      return true;
    } catch (error) {
      logger.error('Erro ao limpar todo o cache:', error.message);
      return false;
    }
  }
}

module.exports = new CacheService();