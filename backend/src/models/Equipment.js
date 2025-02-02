const { Model, DataTypes } = require('sequelize');

class Equipment extends Model {
  static init(sequelize, DataTypes) {
    super.init({
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      serial_number: DataTypes.STRING,
      department: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: DataTypes.TEXT,
      status: {
        type: DataTypes.ENUM('active', 'maintenance', 'inactive'),
        defaultValue: 'active',
      },
      qrcode_url: DataTypes.STRING,
      last_maintenance: DataTypes.DATE,
      maintenance_frequency: {
        type: DataTypes.INTEGER,
        defaultValue: 30,
      },
    }, {
      sequelize,
      tableName: 'equipment',
    });
  }

  static associate(models) {
    this.hasMany(models.ServiceOrder, { 
      foreignKey: 'equipment_id',
      as: 'service_orders' 
    });
    this.hasMany(models.MaintenanceHistory, { 
      foreignKey: 'equipment_id',
      as: 'maintenance_history' 
    });
  }
}

module.exports = Equipment;