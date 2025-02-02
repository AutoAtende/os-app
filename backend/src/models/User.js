const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.VIRTUAL,
      validate: {
        len: [6, 100]
      }
    },
    role: {
      type: DataTypes.ENUM('admin', 'manager', 'technician'),
      defaultValue: 'technician'
    },
    department: {
      type: DataTypes.STRING
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeSave: async (user) => {
        if (user.password) {
          user.password_hash = await bcrypt.hash(user.password, 8);
        }
      }
    }
  });

  User.prototype.checkPassword = function(password) {
    return bcrypt.compare(password, this.password_hash);
  };

  User.associate = function(models) {
    User.hasMany(models.ServiceOrder, { 
      foreignKey: 'created_by', 
      as: 'createdOrders' 
    });
    User.hasMany(models.MaintenanceHistory, { 
      foreignKey: 'performed_by', 
      as: 'performedMaintenance' 
    });
  };

  return User;
};