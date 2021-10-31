'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Coverages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      bodilyInjuryCovInd: {
        type: Sequelize.BOOLEAN
      },
      propertyDmgCovInd: {
        type: Sequelize.BOOLEAN
      },
      medPayCovInd: {
        type: Sequelize.BOOLEAN
      },
      collisionCovInd: {
        type: Sequelize.BOOLEAN
      },
      unCovInd: {
        type: Sequelize.BOOLEAN
      },
      underInsCovInd: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Coverages');
  }
};