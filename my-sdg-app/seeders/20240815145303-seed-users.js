'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Users', [
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        age: 28,
        gender: 'Male',
        role: 'User',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        age: 32,
        gender: 'Female',
        role: 'User',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Admin User',
        email: 'admin@example.com',
        age: 45,
        gender: 'Male',
        role: 'Admin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Test User',
        email: 'user3@example.com',
        age:26,
        gender: 'Female',
        role: 'User',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Another User',
        email: 'user4@example.com',
        age:30,
        gender: 'Male',
        role: 'User',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'New User',
        email: 'user6@gmail.com',
        age:29,
        gender: 'Female',
        role: 'User',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
  }
};

