class MaintenanceHistory extends Model {
    static init(sequelize) {
      super.init({
        maintenance_date: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        type: {
          type: DataTypes.ENUM('preventive', 'corrective', 'predictive'),
          allowNull: false,
        },
        description: DataTypes.TEXT,
        cost: DataTypes.DECIMAL(10, 2),
        parts_replaced: DataTypes.JSON,
      }, {
        sequelize,
        tableName: 'maintenance_history',
      });
    }
  
    static associate(models) {
      this.belongsTo(models.Equipment, { foreignKey: 'equipment_id' });
      this.belongsTo(models.User, { foreignKey: 'performed_by' });
    }
  }

  module.exports = {
    User,
    Equipment,
    ServiceOrder,
    File,
    MaintenanceHistory,
  };