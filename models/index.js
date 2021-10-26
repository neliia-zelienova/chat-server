"use strict";

const sequelize = require("../db");
const User = require("./user");
const Message = require("./message");

User.hasMany(Message, { foreignKey: "userId", onDelete: "cascade" });
Message.belongsTo(User, { foreignKey: "userId", onDelete: "cascade" });

sequelize.sync({ force: false }).then(function () {
  console.log("Database Configured");
});

module.exports = { User, Message };
