const { Model, DataTypes } = require('sequelize');

class Notification extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        recipient_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
        },
        sender_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id',
          },
        },
        type: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: true,
          },
        },
        title: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            len: [5, 255],
          },
        },
        message: {
          type: DataTypes.TEXT,
          allowNull: false,
          validate: {
            notEmpty: true,
          },
        },
        read: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        reference_type: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        reference_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        priority: {
          type: DataTypes.ENUM('low', 'normal', 'high'),
          defaultValue: 'normal',
          validate: {
            isIn: [['low', 'normal', 'high']],
          },
        },
      },
      {
        sequelize,
        modelName: 'Notification',
        tableName: 'notifications',
        timestamps: true,
        underscored: true,
        paranoid: false, // Se quiser soft delete, mude para `true`
        indexes: [
          {
            fields: ['recipient_id'],
          },
          {
            fields: ['read'],
          },
        ],
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, {
      foreignKey: 'recipient_id',
      as: 'recipient',
    });

    this.belongsTo(models.User, {
      foreignKey: 'sender_id',
      as: 'sender',
    });
  }
}

module.exports = Notification;
