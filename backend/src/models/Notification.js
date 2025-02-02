module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
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
  }, {
    tableName: 'notifications',
    timestamps: true,
    underscored: true,
    paranoid: false,
    indexes: [
      {
        fields: ['recipient_id'],
      },
      {
        fields: ['read'],
      },
    ],
  });

  Notification.associate = function(models) {
    Notification.belongsTo(models.User, {
      foreignKey: 'recipient_id',
      as: 'recipient',
    });

    Notification.belongsTo(models.User, {
      foreignKey: 'sender_id',
      as: 'sender',
    });
  };

  return Notification;
};