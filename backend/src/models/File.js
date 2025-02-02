const { Model, DataTypes } = require('sequelize');

class File extends Model {
  static init(sequelize, DataTypes) {
    super.init({
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      path: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      url: {
        type: DataTypes.VIRTUAL,
        get() {
          return `${process.env.APP_URL}/files/${this.path}`;
        },
      },
    }, {
      sequelize,
      tableName: 'files',
    });
  }

  static associate(models) {
    this.belongsTo(models.ServiceOrder, { 
      foreignKey: 'service_order_id',
      as: 'service_order' 
    });
  }
}

module.exports = File;