'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Alcohol_Consumptions', [
      {
        user_id: 1,
        date: new Date('2024-08-10'),
        // time: '19:30',
        amount: 3,
        context: 'Social Gathering',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 2,
        date: new Date('2024-08-12'),
        // time: '21:00',
        amount: 5,
        context: 'Night Out',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 3,
        date: new Date('2024-08-14'),
        // time: '18:00',
        amount: 2,
        context: 'Dinner',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 4,
        date: new Date('2024-08-16'),
        // time: '20:30',
        amount: 4,
        context: 'Celebration',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 5,
        date: new Date('2024-08-18'),
        // time: '22:00',
        amount: 6,
        context: 'Party',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 6,
        date: new Date('2024-08-20'),
        // time: '19:00',
        amount: 3,
        context: 'Dinner',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Alcohol_Consumptions', null, {});
  }
};

