module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.createTable('maintenance', {
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
        technician_id: {
          type: Sequelize.INTEGER,
          references: { model: 'users', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        type: {
          type: Sequelize.ENUM('preventive', 'corrective', 'predictive'),
          allowNull: false
        },
        status: {
          type: Sequelize.ENUM('pending', 'in_progress', 'completed', 'cancelled'),
          defaultValue: 'pending'
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        scheduled_date: {
          type: Sequelize.DATE,
          allowNull: false
        },
        completed_date: {
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
      await queryInterface.dropTable('maintenance');
    }
  };