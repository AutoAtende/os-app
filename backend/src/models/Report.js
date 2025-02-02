// src/models/Report.js
const { Model, DataTypes } = require('sequelize');

class Report extends Model {
  static init(sequelize) {
    super.init({
      type: {
        type: DataTypes.STRING,
        allowNull: false
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      filters: {
        type: DataTypes.JSONB
      },
      file_url: {
        type: DataTypes.STRING
      },
      status: {
        type: DataTypes.ENUM('processing', 'completed', 'error'),
        defaultValue: 'processing'
      },
      error_message: {
        type: DataTypes.TEXT
      }
    }, {
      sequelize,
      tableName: 'reports'
    });
    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator'
    });
  }
}

module.exports = Report;