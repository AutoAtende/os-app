const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Notification extends Model {
    static associate(models) {
      // Definição das associações
      this.belongsTo(models.User, {
        foreignKey: 'recipient_id',
        as: 'recipient'
      });
      
      this.belongsTo(models.User, {
        foreignKey: 'sender_id',
        as: 'sender'
      });
    }
  }

  Notification.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    recipient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users', // Nome da tabela no banco de dados
        key: 'id'
      }
    },
    sender_id: { // Campo faltante na versão original
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [5, 255]
      }
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    reference_type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    reference_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    priority: {
      type: DataTypes.ENUM,
      values: ['low', 'normal', 'high'],
      defaultValue: 'normal',
      validate: {
        isIn: [['low', 'normal', 'high']]
      }
    }
  }, {
    sequelize,
    modelName: 'Notification',
    tableName: 'notifications',
    timestamps: true,
    underscored: true,
    paranoid: false, // Adicione se quiser soft delete
    indexes: [
      {
        fields: ['recipient_id']
      },
      {
        fields: ['read']
      }
    ]
  });

  return Notification;
};