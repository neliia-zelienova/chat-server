"use strict";

const db = require("../db");

const { STRING, BOOLEAN } = require("sequelize");

const instanceMethods = {
  toJSON() {
    const values = Object.assign({}, this.get());
    delete values.password;
    return values;
  },
};

const User = db.define(
  "Users",
  {
    username: {
      type: STRING,
      unique: true,
      validate: {
        is: /[A-Za-z0-9]{3,}/,
        min: 3,
      },
    },
    password: {
      type: STRING,
      validate: {
        is: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/,
      },
      // async set(value) {
      //   const salt = await bcrypt.genSalt(Number(SALT_FACTOR));
      //   const password = await bcrypt.hash(value, salt);
      //   console.log("password", password);
      //   this.setDataValue("password", password);
      // },
    },
    admin: { type: BOOLEAN, defaultValue: false },
    online: { type: BOOLEAN, defaultValue: false },
    muted: { type: BOOLEAN, defaultValue: false },
    banned: { type: BOOLEAN, defaultValue: false },
    color: { type: STRING, defaultValue: "000000" },
  },

  {
    instanceMethods,
    defaultScope: {
      attributes: { exclude: ["password", "createdAt", "updatedAt"] },
    },
    scopes: {
      withPassword: {
        attributes: {},
      },
    },
  }
);

module.exports = User;
