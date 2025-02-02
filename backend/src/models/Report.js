module.exports = (sequelize, DataTypes) => {
    const Report = sequelize.define('Report', {
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
      tableName: 'reports'
    });
  
    Report.associate = function(models) {
      Report.belongsTo(models.User, {
        foreignKey: 'created_by',
        as: 'creator'
      });
    };
  
    return Report;
  };
  