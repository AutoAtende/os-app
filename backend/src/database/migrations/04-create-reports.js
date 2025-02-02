module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.createTable('reports', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        type: {
          type: Sequelize.STRING,
          allowNull: false
        },
        title: {
          type: Sequelize.STRING,
          allowNull: false
        },
        filters: {
          type: Sequelize.JSONB
        },
        file_url: {
          type: Sequelize.STRING
        },
        status: {
          type: Sequelize.ENUM('processing', 'completed', 'error'),
          defaultValue: 'processing'
        },
        error_message: {
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
      await queryInterface.dropTable('reports');
    }
  };