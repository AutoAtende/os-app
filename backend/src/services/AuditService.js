const { AuditLog, User } = require('../models');
const logger = require('../utils/logger');

class AuditService {
  constructor() {
    this.ignoredFields = ['updated_at', 'created_at'];
  }

  async logAction(params) {
    try {
      const {
        userId,
        action,
        entityType,
        entityId,
        oldValues,
        newValues,
        metadata = {}
      } = params;

      await AuditLog.create({
        user_id: userId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        old_values: oldValues,
        new_values: newValues,
        metadata: {
          ...metadata,
          ip: metadata.ip,
          userAgent: metadata.userAgent,
          timestamp: new Date()
        }
      });

    } catch (error) {
      logger.error('Erro ao registrar log de auditoria:', error);
    }
  }

  async trackChanges(entity, changes, userId, metadata = {}) {
    const changedFields = Object.keys(changes)
      .filter(field => !this.ignoredFields.includes(field));

    if (changedFields.length === 0) return;

    const oldValues = {};
    const newValues = {};

    changedFields.forEach(field => {
      oldValues[field] = entity[field];
      newValues[field] = changes[field];
    });

    await this.logAction({
      userId,
      action: 'UPDATE',
      entityType: entity.constructor.name,
      entityId: entity.id,
      oldValues,
      newValues,
      metadata
    });
  }

  async getAuditTrail(params) {
    try {
      const {
        entityType,
        entityId,
        startDate,
        endDate,
        userId,
        page = 1,
        limit = 20
      } = params;

      const where = {};
      
      if (entityType) where.entity_type = entityType;
      if (entityId) where.entity_id = entityId;
      if (userId) where.user_id = userId;
      if (startDate || endDate) {
        where.created_at = {};
        if (startDate) where.created_at[Op.gte] = startDate;
        if (endDate) where.created_at[Op.lte] = endDate;
      }

      const logs = await AuditLog.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }
        ],
        order: [['created_at', 'DESC']],
        limit,
        offset: (page - 1) * limit
      });

      return {
        logs: logs.rows,
        total: logs.count,
        page,
        pages: Math.ceil(logs.count / limit)
      };

    } catch (error) {
      logger.error('Erro ao buscar logs de auditoria:', error);
      throw new Error('Falha ao buscar histórico de auditoria');
    }
  }

  async getEntityHistory(entityType, entityId) {
    try {
      const logs = await AuditLog.findAll({
        where: {
          entity_type: entityType,
          entity_id: entityId
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      return this.formatEntityHistory(logs);

    } catch (error) {
      logger.error('Erro ao buscar histórico da entidade:', error);
      throw new Error('Falha ao buscar histórico');
    }
  }

  formatEntityHistory(logs) {
    return logs.map(log => {
      const changes = this.compareValues(log.old_values, log.new_values);
      
      return {
        id: log.id,
        date: log.created_at,
        user: log.user,
        action: log.action,
        changes,
        metadata: log.metadata
      };
    });
  }

  compareValues(oldValues, newValues) {
    const changes = [];
    const allFields = new Set([
      ...Object.keys(oldValues || {}),
      ...Object.keys(newValues || {})
    ]);

    allFields.forEach(field => {
      if (this.ignoredFields.includes(field)) return;

      const oldValue = oldValues?.[field];
      const newValue = newValues?.[field];

      if (oldValue !== newValue) {
        changes.push({
          field,
          from: oldValue,
          to: newValue
        });
      }
    });

    return changes;
  }

  // Migration para a tabela de auditoria
  static get migration() {
    return {
      up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('audit_logs', {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          user_id: {
            type: Sequelize.INTEGER,
            references: { model: 'users', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
          },
          action: {
            type: Sequelize.STRING,
            allowNull: false
          },
          entity_type: {
            type: Sequelize.STRING,
            allowNull: false
          },
          entity_id: {
            type: Sequelize.INTEGER,
            allowNull: false
          },
          old_values: {
            type: Sequelize.JSONB
          },
          new_values: {
            type: Sequelize.JSONB
          },
          metadata: {
            type: Sequelize.JSONB
          },
          created_at: {
            type: Sequelize.DATE,
            allowNull: false
          },
          // Continuação da migration anterior...
          updated_at: {
            type: Sequelize.DATE,
            allowNull: false
          },
          ip_address: {
            type: Sequelize.STRING
          },
          user_agent: {
            type: Sequelize.STRING
          },
          browser: {
            type: Sequelize.STRING
          },
          platform: {
            type: Sequelize.STRING
          }
        });

        // Índices para melhor performance
        await queryInterface.addIndex('audit_logs', ['entity_type', 'entity_id']);
        await queryInterface.addIndex('audit_logs', ['user_id']);
        await queryInterface.addIndex('audit_logs', ['created_at']);
      },

      down: async (queryInterface) => {
        await queryInterface.dropTable('audit_logs');
      }
    };
  }
}

// Modelo Sequelize para AuditLog
const AuditLogModel = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define('AuditLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'FAILED_LOGIN']]
      }
    },
    entity_type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    entity_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    old_values: {
      type: DataTypes.JSONB
    },
    new_values: {
      type: DataTypes.JSONB
    },
    metadata: {
      type: DataTypes.JSONB
    },
    ip_address: DataTypes.STRING,
    user_agent: DataTypes.STRING,
    browser: DataTypes.STRING,
    platform: DataTypes.STRING
  }, {
    tableName: 'audit_logs',
    timestamps: true
  });

  AuditLog.associate = (models) => {
    AuditLog.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return AuditLog;
};

// Middleware para capturar automaticamente mudanças nos modelos
const auditMiddleware = (schema) => {
  schema.addHook('beforeUpdate', async (instance, options) => {
    if (!options.userId) return;

    const changes = instance.changed();
    if (!changes) return;

    const oldValues = {};
    const newValues = {};

    changes.forEach(field => {
      oldValues[field] = instance._previousDataValues[field];
      newValues[field] = instance.dataValues[field];
    });

    await AuditLog.create({
      user_id: options.userId,
      action: 'UPDATE',
      entity_type: instance.constructor.name,
      entity_id: instance.id,
      old_values: oldValues,
      new_values: newValues,
      metadata: {
        ip: options.ip,
        userAgent: options.userAgent
      }
    });
  });

  schema.addHook('afterCreate', async (instance, options) => {
    if (!options.userId) return;

    await AuditLog.create({
      user_id: options.userId,
      action: 'CREATE',
      entity_type: instance.constructor.name,
      entity_id: instance.id,
      new_values: instance.dataValues,
      metadata: {
        ip: options.ip,
        userAgent: options.userAgent
      }
    });
  });

  schema.addHook('beforeDestroy', async (instance, options) => {
    if (!options.userId) return;

    await AuditLog.create({
      user_id: options.userId,
      action: 'DELETE',
      entity_type: instance.constructor.name,
      entity_id: instance.id,
      old_values: instance.dataValues,
      metadata: {
        ip: options.ip,
        userAgent: options.userAgent
      }
    });
  });
};

// Middleware Express para incluir informações de auditoria
const auditMiddlewareExpress = (req, res, next) => {
  if (req.user) {
    req.auditInfo = {
      userId: req.user.id,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      browser: req.get('sec-ch-ua'),
      platform: req.get('sec-ch-ua-platform')
    };
  }
  next();
};

module.exports = {
  AuditService,
  AuditLogModel,
  auditMiddleware,
  auditMiddlewareExpress
};