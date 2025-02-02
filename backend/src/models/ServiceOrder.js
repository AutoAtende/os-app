const { Model, DataTypes } = require('sequelize');

class ServiceOrder extends Model {
  static init(sequelize) {
    super.init(
      {
        description: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        type: {
          type: DataTypes.ENUM('preventive', 'corrective', 'predictive'),
          allowNull: false,
        },
        priority: {
          type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
          allowNull: false,
          defaultValue: 'medium',
        },
        status: {
          type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'cancelled'),
          allowNull: false,
          defaultValue: 'pending',
        },
        scheduled_for: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        completed_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        cost: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: true,
          validate: {
            min: 0,
          },
        },
        notes: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: 'ServiceOrder',
        tableName: 'service_orders',
        underscored: true,
        timestamps: true,
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.Equipment, {
      foreignKey: 'equipment_id',
      as: 'equipment',
    });
    this.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator',
    });
    this.belongsTo(models.User, {
      foreignKey: 'assigned_to',
      as: 'technician',
    });
    this.hasMany(models.File, {
      foreignKey: 'service_order_id',
      as: 'files',
    });
  }
}

module.exports = ServiceOrder;
