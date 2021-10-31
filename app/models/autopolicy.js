'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AutoPolicy extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.Vehicle, {
        foreignKey: {
          name: 'AutoPolicyId'
        }
      }); 
      this.hasMany(models.Coverage, {
        foreignKey: {
          name: 'AutoPolicyId'
        }
      });
    }
  };
  AutoPolicy.init({
    policyNumber: DataTypes.STRING,
    premium: DataTypes.INTEGER,
    policyStart: DataTypes.DATE,
    policyEnd: DataTypes.DATE,
    status: DataTypes.STRING,
    requireUWApprovalInd: DataTypes.BOOLEAN,
    isUWApprovedInd: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'AutoPolicy',
  });
  return AutoPolicy;
};