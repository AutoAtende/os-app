// src/database/migrations/07-create-maintenance-history.js
module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.createTable('maintenance_history', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        equipment_id: {
          type: Sequelize.INTEGER,
          references: { model: 'equipment', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        maintenance_date: {
          type: Sequelize.DATE,
          allowNull: false
        },
        type: {
          type: Sequelize.ENUM('preventive', 'corrective', 'predictive'),
          allowNull: false
        },
        description: {
          type: Sequelize.TEXT
        },
        cost: {
          type: Sequelize.DECIMAL(10, 2),
          validate: {
            min: 0
          }
        },
        parts_replaced: {
          type: Sequelize.JSON
        },
        performed_by: {
          type: Sequelize.INTEGER,
          references: { model: 'users', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false
        }
      });
    },
    down: async (queryInterface) => {
      await queryInterface.dropTable('maintenance_history');
    }
  };