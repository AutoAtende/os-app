const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

class User extends Model {
  static init(sequelize) {
    super.init(
      {
        name: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: true,
          },
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
          validate: {
            isEmail: true,
          },
        },
        password: {
          type: DataTypes.VIRTUAL,
        },
        password_hash: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        role: {
          type: DataTypes.ENUM('admin', 'manager', 'technician'),
          allowNull: false,
          defaultValue: 'technician',
        },
        active: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
      },
      {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        timestamps: true,
        underscored: true,
        hooks: {
          beforeSave: async (user) => {
            if (user.password) {
              user.password_hash = await bcrypt.hash(user.password, 8);
            }
          },
        },
      }
    );
    return this;
  }

  static associate(models) {
    this.hasMany(models.ServiceOrder, {
      foreignKey: 'created_by',
      as: 'service_orders',
    });
    this.hasMany(models.MaintenanceHistory, {
      foreignKey: 'performed_by',
      as: 'maintenance_history',
    });
  }

  checkPassword(password) {
    return bcrypt.compare(password, this.password);
  }
}

module.exports = User;
