'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Users', 'password', {
      type: Sequelize.STRING,
      allowNull: false,
      after: 'email' // Add password column after email
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Users', 'password');
  }
};
