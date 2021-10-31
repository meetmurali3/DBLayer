require('dotenv').config();
const { DB_HOST, DB_USERNAME, DB_PASSWORD } = process.env;


module.exports = {
  "development": {
    "username": DB_USERNAME,
    "password": DB_PASSWORD,
    "database": "database_development",
    "host": DB_HOST,
    "dialect": "postgres",
  },
  "test": {
    "username": DB_USERNAME,
    "password": DB_PASSWORD,
    "database": "database_development",
    "host": DB_HOST,
    "dialect": "postgres"
  },
  "production": {
    "username": "ycezkhfbrcjkcm",
    "password": "0e5ace75cbb4d5f807e862dd3656caa7145534ff44b08d1a9cca60464d7bced2",
    "database": "df7ianoa8v1esc",
    "host": "ec2-35-171-41-147.compute-1.amazonaws.com",
    "dialect": "postgres"
  }
}
