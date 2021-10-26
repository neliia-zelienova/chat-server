"use strict";

const bcrypt = require("bcryptjs");

require("dotenv").config();

const SALT_FACTOR = process.env.SALT_FACTOR;

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const salt = await bcrypt.genSalt(Number(SALT_FACTOR));
    const cryptedPassword = await bcrypt.hash("admin1!", salt);
    return queryInterface.bulkInsert("Users", [
      {
        username: "admin",
        password: cryptedPassword,
        admin: true,
        online: false,
        muted: false,
        banned: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Users", null, {});
  },
};
