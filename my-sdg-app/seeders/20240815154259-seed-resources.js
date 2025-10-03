'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Resources', [
      {
        title: 'Alcohol Awareness Program',
        description: 'A program to raise awareness about alcohol consumption.',
        link: 'https://example.com/alcohol-awareness',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Counseling Services',
        description: 'Free counseling for alcohol abuse.',
        link: 'https://example.com/counseling-services',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Support Groups',
        description: 'Support groups for individuals struggling with alcohol addiction.',
        link: 'https://example.com/support-groups',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Rehabilitation Centers',
        description: 'Rehabilitation centers for individuals seeking treatment for alcohol addiction.',
        link: 'https://example.com/rehabilitation-centers',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Online Resources',
        description: 'Online resources for individuals looking for information on alcohol abuse.',
        link: 'https://example.com/online-resources',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Helpline',
        description: 'A helpline for individuals in need of immediate assistance with alcohol abuse.',
        link: 'https://example.com/helpline',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Resources', null, {});
  }
};

