'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('users', [{
      name: 'Administrador',
      email: 'admin@admin.com',
      password_hash: await bcrypt.hash('123456', 8),  // Mudamos de password para password_hash
      role: 'admin',
      active: true,
      created_at: new Date(),
      updated_at: new Date()
    }]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('users', null, {});
  }
};