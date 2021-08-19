const { ObjectID: ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const { getColor } = require("../helpers/color-picker");

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const SALT_FACTOR = process.env.SALT_FACTOR;

module.exports = function exportFunc(collection) {
  const randomColor = getColor(44, 153);
  const salt = bcrypt.genSaltSync(Number(SALT_FACTOR));
  const hash = bcrypt.hashSync(ADMIN_PASSWORD, Number(salt));
  return collection.updateOne(
    { admin: true },
    { $set: { password: hash, color: randomColor } },
    { upsert: false }
  );
};
