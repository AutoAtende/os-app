module.exports = (sequelize, DataTypes) => {
  const ServiceOrder = sequelize.define('ServiceOrder', {
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
  }, {
    tableName: 'service_orders',
    underscored: true,
    timestamps: true,
  });

  ServiceOrder.associate = function(models) {
    ServiceOrder.belongsTo(models.Equipment, {
      foreignKey: 'equipment_id',
      as: 'equipment',
    });
    ServiceOrder.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator',
    });
    ServiceOrder.belongsTo(models.User, {
      foreignKey: 'assigned_to',
      as: 'technician',
    });
    ServiceOrder.hasMany(models.File, {
      foreignKey: 'service_order_id',
      as: 'files',
    });
  };

  return ServiceOrder;
};