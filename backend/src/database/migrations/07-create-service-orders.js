// src/database/migrations/08-create-service-orders.js
module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.createTable('service_orders', {
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
        description: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        type: {
          type: Sequelize.ENUM('preventive', 'corrective', 'predictive'),
          allowNull: false
        },
        priority: {
          type: Sequelize.ENUM('low', 'medium', 'high', 'critical'),
          defaultValue: 'medium'
        },
        status: {
          type: Sequelize.ENUM('pending', 'in_progress', 'completed', 'cancelled'),
          defaultValue: 'pending'
        },
        scheduled_for: {
          type: Sequelize.DATE,
          allowNull: false
        },
        completed_at: {
          type: Sequelize.DATE
        },
        cost: {
          type: Sequelize.DECIMAL(10, 2)
        },
        notes: {
          type: Sequelize.TEXT
        },
        created_by: {
          type: Sequelize.INTEGER,
          references: { model: 'users', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        assigned_to: {
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
      await queryInterface.dropTable('service_orders');
    }
  };