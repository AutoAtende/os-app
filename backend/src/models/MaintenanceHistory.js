module.exports = (sequelize, DataTypes) => {
  const MaintenanceHistory = sequelize.define('MaintenanceHistory', {
    maintenance_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('preventive', 'corrective', 'predictive'),
      allowNull: false,
    },
    description: DataTypes.TEXT,
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      validate: {
        min: 0,
      },
    },
    parts_replaced: DataTypes.JSON,
  }, {
    tableName: 'maintenance_history',
  });

  MaintenanceHistory.associate = function(models) {
    MaintenanceHistory.belongsTo(models.Equipment, {
      foreignKey: 'equipment_id',
      as: 'equipment',
    });
    MaintenanceHistory.belongsTo(models.User, {
      foreignKey: 'performed_by',
      as: 'technician',
    });
  };

  return MaintenanceHistory;
};