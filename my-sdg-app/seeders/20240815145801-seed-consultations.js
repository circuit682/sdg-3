'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Consultations', [
      {
        user_id: 1,
        date: new Date('2024-08-07'),
        provider_name: 'Dr. Jane Doe',
        recommendations: 'Continue moderate consumption, no immediate concerns.',
        notes: 'Positive consultation, no follow-up needed.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 2,
        date: new Date('2024-08-09'),
        provider_name: 'Dr. John Smith',
        recommendations: 'Seek further counseling, reduce alcohol intake.',
        notes: 'High concern due to risky behavior.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 3,
        date: new Date('2024-08-11'),
        provider_name: 'Dr. Sarah Johnson',
        recommendations: 'Monitor consumption, follow-up in 2 weeks.',
        notes: 'Moderate concern due to increased consumption.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 4,
        date: new Date('2024-08-13'),
        provider_name: 'Dr. Michael Brown',
        recommendations: 'Continue low consumption, no immediate concerns.',
        notes: 'Positive consultation, no follow-up needed.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 5,
        date: new Date('2024-08-15'),
        provider_name: 'Dr. Lisa White',
        recommendations: 'Seek immediate intervention, reduce alcohol intake.',
        notes: 'High concern due to excessive consumption.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        user_id: 6,
        date: new Date('2024-08-17'),
        provider_name: 'Dr. David Green',
        recommendations: 'Monitor consumption, follow-up in 1 week.',
        notes: 'Moderate concern due to increased consumption.',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Consultations', null, {});
  }
};


