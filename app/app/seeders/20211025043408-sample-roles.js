'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
     await queryInterface.bulkInsert('Users', [{
      firstName: 'Sarah',
      lastName: 'Jones',
      userName: 'jsarah',
      password: 'jsarah',
      roleName: 'Underwriter',
      createdAt: new Date(),
      updatedAt: new Date()
      },
      {
        firstName: 'Adam',
        lastName: 'Northrup',
        userName: 'nadam',
        password:'nadam',
        roleName: 'UWAssitant',
        createdAt: new Date(),
        updatedAt: new Date()
        }], {});
  },


  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
