const Sequelize = require("sequelize");

require("dotenv").config();
const SERVER_HOST = process.env.DB_SERVER_HOST;
const USERNAME = process.env.DB_USERNAME;
const PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;

const db = new Sequelize(DB_NAME, USERNAME, PASSWORD, {
  host: SERVER_HOST,
  dialect: "mysql",
});

module.exports = db;
