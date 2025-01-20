// Migration: 02-create-equipment.js
module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.createTable('equipment', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false
        },
        code: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        serial_number: {
          type: Sequelize.STRING
        },
        department: {
          type: Sequelize.STRING,
          allowNull: false
        },
        description: {
          type: Sequelize.TEXT
        },
        status: {
          type: Sequelize.ENUM('active', 'maintenance', 'inactive'),
          defaultValue: 'active'
        },
        maintenance_frequency: {
          type: Sequelize.INTEGER, // em dias
          defaultValue: 30
        },
        last_maintenance: {
          type: Sequelize.DATE
        },
        qrcode_url: {
          type: Sequelize.STRING
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
      await queryInterface.dropTable('equipment');
    }
  };