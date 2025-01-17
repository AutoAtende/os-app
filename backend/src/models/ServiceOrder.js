class ServiceOrder extends Model {
    static init(sequelize) {
      super.init({
        description: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        type: {
          type: DataTypes.ENUM('preventive', 'corrective', 'predictive'),
          allowNull: false,
        },
        priority: {
          type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
          defaultValue: 'medium',
        },
        status: {
          type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'cancelled'),
          defaultValue: 'pending',
        },
        scheduled_for: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        completed_at: DataTypes.DATE,
        cost: DataTypes.DECIMAL(10, 2),
        notes: DataTypes.TEXT,
      }, {
        sequelize,
        tableName: 'service_orders',
      });
    }
  
    static associate(models) {
      this.belongsTo(models.Equipment, { foreignKey: 'equipment_id', as: 'equipment' });
      this.belongsTo(models.User, { foreignKey: 'created_by', as: 'creator' });
      this.belongsTo(models.User, { foreignKey: 'assigned_to', as: 'technician' });
      this.hasMany(models.File, { as: 'files' });
    }
  }

  module.exports = {
    ServiceOrder
  };