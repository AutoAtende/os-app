const { Model, DataTypes } = require('sequelize');

class MaintenanceHistory extends Model {
  static init(sequelize) {
    super.init(
      {
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
      },
      {
        sequelize,
        tableName: 'maintenance_history',
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
      foreignKey: 'performed_by',
      as: 'technician',
    });
  }
}

module.exports = MaintenanceHistory;
