'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('AutoPolicies', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      policyNumber: {
        type: Sequelize.STRING
      },
      premium: {
        type: Sequelize.INTEGER
      },
      policyStart: {
        type: Sequelize.DATE
      },
      policyEnd: {
        type: Sequelize.DATE
      },
      status: {
        type: Sequelize.STRING
      },
      requireUWApprovalInd: {
        type: Sequelize.BOOLEAN
      },
      isUWApprovedInd: {
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
    await queryInterface.dropTable('AutoPolicies');
  }
};