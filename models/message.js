"use strict";
const db = require("../db");
const { Model, STRING, INTEGER } = require("sequelize");

const instanceMethods = {
  toJSON() {
    const values = Object.assign({}, this.get());

    return values;
  },
};

// class Message extends Model {
//   /**
//    * Helper method for defining associations.
//    * This method is not a part of Sequelize lifecycle.
//    * The `models/index` file will call this method automatically.
//    */
//   static associate(models) {
//     // define association here
//   }
// }

const Message = db.define(
  "Messages",
  {
    text: { type: STRING },
    userId: { type: INTEGER },
  },
  {
    instanceMethods,
  }
);

module.exports = Message;
