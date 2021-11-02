require('dotenv').config();
const { DB_HOST, DB_USERNAME, DB_PASSWORD } = process.env;


module.exports = {
  "development": {
    "username": "atnlzqgieewiwt",
    "password": "9ad719ed579b458470ab2abd76384895a7beeabafc0b37841ac70e847aba3f1a",
    "database": "dcb1r238t6df6i",
    "host": "ec2-35-169-103-164.compute-1.amazonaws.com",
    "dialect": "postgres",
    "dialectOptions": {
      "ssl": {require:true,rejectUnauthorized: false}
    }
  },
  "test": {
    "username": DB_USERNAME,
    "password": DB_PASSWORD,
    "database": "database_development",
    "host": DB_HOST,
    "dialect": "postgres"
  },
  "production": {
    "username": "atnlzqgieewiwt",
    "password": "9ad719ed579b458470ab2abd76384895a7beeabafc0b37841ac70e847aba3f1a",
    "database": "dcb1r238t6df6i",
    "host": "ec2-35-169-103-164.compute-1.amazonaws.com",
    "dialect": "postgres",
    "dialectOptions": {
      "ssl": {require:true,rejectUnauthorized: false}
    }
  }
}
