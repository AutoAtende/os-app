// src/database/migrations/06-create-files.js
module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.createTable('files', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false
        },
        path: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        service_order_id: {
          type: Sequelize.INTEGER,
          references: { model: 'service_orders', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
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
      await queryInterface.dropTable('files');
    }
  };