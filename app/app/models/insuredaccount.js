'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class InsuredAccount extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.Address, {
        foreignKey: {
          name: 'InsuredAccountId'
        }
      });
      this.hasMany(models.AutoPolicy, {
        foreignKey: {
          name: 'InsuredAccountId'
        }
      });      
    }
  };
  InsuredAccount.init({
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    gender: DataTypes.CHAR,
    dob: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'InsuredAccount',
  });
  return InsuredAccount;
};