'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Coverage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Coverage.init({
    bodilyInjuryCovInd: DataTypes.BOOLEAN,
    propertyDmgCovInd: DataTypes.BOOLEAN,
    medPayCovInd: DataTypes.BOOLEAN,
    collisionCovInd: DataTypes.BOOLEAN,
    unCovInd: DataTypes.BOOLEAN,
    underInsCovInd: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Coverage',
  });
  return Coverage;
};