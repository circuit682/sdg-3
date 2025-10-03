'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Goals', [
      {
        user_id: 1,
        end_date: new Date('2024-12-31'),
        status: 'In Progress',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 2,
        end_date: new Date('2025-03-01'),
        status: 'Not Started',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 3,
        end_date: new Date('2024-08-15'),
        status: 'Completed',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 4,
        end_date: new Date('2024-11-30'),
        status: 'In Progress',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 5,
        end_date: new Date('2025-01-01'),
        status: 'Not Started',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 6,
        end_date: new Date('2024-10-31'),
        status: 'In Progress',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Goals', null, {});
  }
};
