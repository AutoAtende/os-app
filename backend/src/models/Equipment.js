module.exports = (sequelize, DataTypes) => {
  const Equipment = sequelize.define('Equipment', {
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
    tableName: 'equipment'
  });

  Equipment.associate = function(models) {
    Equipment.hasMany(models.ServiceOrder, {
      foreignKey: 'equipment_id',
      as: 'service_orders',
    });
    Equipment.hasMany(models.MaintenanceHistory, {
      foreignKey: 'equipment_id',
      as: 'maintenance_history',
    });
  };

  return Equipment;
};