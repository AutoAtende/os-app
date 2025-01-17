const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

class User extends Model {
  static init(sequelize) {
    super.init({
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
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('admin', 'manager', 'technician'),
        defaultValue: 'technician',
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    }, {
      sequelize,
      tableName: 'users',
      hooks: {
        beforeSave: async (user) => {
          if (user.password && user.changed('password')) {
            user.password = await bcrypt.hash(user.password, 8);
          }
        },
      },
    });
  }

  static associate(models) {
    this.hasMany(models.ServiceOrder, { foreignKey: 'created_by', as: 'service_orders' });
  }

  checkPassword(password) {
    return bcrypt.compare(password, this.password);
  }
}

module.exports = {
    User
  };