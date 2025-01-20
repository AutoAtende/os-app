module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.createTable('notifications', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        recipient_id: {
          type: Sequelize.INTEGER,
          references: { model: 'users', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        type: {
          type: Sequelize.STRING,
          allowNull: false
        },
        title: {
          type: Sequelize.STRING,
          allowNull: false
        },
        message: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        read: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        reference_type: {
          type: Sequelize.STRING
        },
        reference_id: {
          type: Sequelize.INTEGER
        },
        priority: {
          type: Sequelize.ENUM('low', 'normal', 'high'),
          defaultValue: 'normal'
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
      await queryInterface.dropTable('notifications');
    }
  };