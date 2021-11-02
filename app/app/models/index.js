'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.js')[env];
const db = {};

let sequelize;
/**if (true) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {*/
  sequelize = new Sequelize(config.database, config.username, config.password, config);
//}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});



db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.user = require("./user.js")(sequelize, Sequelize);
db.authtoken = require("./authtoken.js")(sequelize, Sequelize);
db.account = require("./insuredaccount.js")(sequelize, Sequelize);
db.address = require("./address.js")(sequelize, Sequelize);
db.autopolicy = require("./autopolicy.js")(sequelize, Sequelize);
db.vehicle = require("./vehicle.js")(sequelize, Sequelize);
db.coverage = require("./coverage.js")(sequelize, Sequelize);
db.account.hasMany(db.address);
db.account.hasMany(db.autopolicy);
db.autopolicy.hasMany(db.vehicle);
db.autopolicy.hasMany(db.coverage);
db.user.hasMany(db.autopolicy);
/**db.address.belongsTo(db.account, {
  foreignKey: "AccountID",
  as: "Account",
});**/
/*
db.address.belongsTo(db.account, {
  foreignKey: "AccountID",
  as: "Account",
});
db.vehicle.belongsTo(db.autopolicy, {
  foreignKey: "AutoPolicyId",
  as: "Policy",
});
db.coverage.belongsTo(db.autopolicy, {
  foreignKey: "AutoPolicyId",
  as: "Policy",
});

db.autopolicy.belongsTo(db.account, {
  foreignKey: "AccountID",
  as: "Account",
});
db.autopolicy.belongsTo(db.user, {
  foreignKey: "UserID",
  as: "User",
}); 
db.authtoken.belongsTo(db.user, {
  foreignKey: "UserID",
  as: "User",
});
*/
module.exports = db;