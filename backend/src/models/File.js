module.exports = (sequelize, DataTypes) => {
  const File = sequelize.define('File', {
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
    tableName: 'files'
  });

  File.associate = function(models) {
    File.belongsTo(models.ServiceOrder, {
      foreignKey: 'service_order_id',
      as: 'service_order'
    });
  };

  return File;
};