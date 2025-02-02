const { Model, DataTypes } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    const Notification = sequelize.define('Notification', {
      recipient_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { 
          model: 'users', 
          key: 'id' 
        }
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      reference_type: {
        type: DataTypes.STRING
      },
      reference_id: {
        type: DataTypes.INTEGER
      },
      priority: {
        type: DataTypes.ENUM('low', 'normal', 'high'),
        defaultValue: 'normal'
      }
    }, {
      tableName: 'notifications',
      timestamps: true,
      underscored: true
    });
  
    Notification.associate = function(models) {
      Notification.belongsTo(models.User, {
        foreignKey: 'recipient_id',
        as: 'recipient'
      });
      
      Notification.belongsTo(models.User, {
        foreignKey: 'sender_id',
        as: 'sender'
      });
    };
  
    return Notification;
  };