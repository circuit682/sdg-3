'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Self_Assessments', [
      {
        user_id: 1,
        date: new Date('2024-08-05'),
        risk_level: 'Low',
        scores: 3,
        notes: 'Moderate consumption, no risk of abuse.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 2,
        date: new Date('2024-08-06'),
        risk_level: 'High',
        scores: 7,
        notes: 'High risk of alcohol abuse.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 3,
        date: new Date('2024-08-07'),
        risk_level: 'Moderate',
        scores: 5,
        notes: 'Increased consumption, moderate risk of abuse.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 4,
        date: new Date('2024-08-08'),
        risk_level: 'Low',
        scores: 2,
        notes: 'Low consumption, no risk of abuse.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 5,
        date: new Date('2024-08-09'),
        risk_level: 'High',
        scores: 8,
        notes: 'Excessive consumption, high risk of abuse.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 6,
        date: new Date('2024-08-10'),
        risk_level: 'Moderate',
        scores: 6,
        notes: 'Increased consumption, moderate risk of abuse.',
        createdAt: new Date(),
        updatedAt: new Date()
      }
  
    ]);
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Self_Assessments', null, {});
  }
};

