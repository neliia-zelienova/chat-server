const model = require("../db/users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { HttpCode } = require("../../helpers/constants");

require("dotenv").config();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const SALT_FACTOR = process.env.SALT_FACTOR;

const sendUserToken = async (res, user) => {
  console.log("create token");
  const { id, username, admin, banned, online, muted } = user;
  console.log("user", user);
  const payload = { id, username };
  const token = jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: "2h" });
  return res.status(HttpCode.OK).json({
    data: { id, username, admin, banned, online, muted, token },
  });
};

const login = async (req, res, next) => {
  try {
    console.log("login");
    const { username, password } = req.body;
    console.log(" username, password", username, password);
    const user = await model.findByUsername(username);
    if (user) {
      console.log("user TRUE", password, user.password);
      //login user if password valid
      const compare = await bcrypt.compare(password, user.password);
      console.log("compare", compare);
      if (compare) {
        console.log("compare true");
        return sendUserToken(res, user);
      }
      console.log("compare false");
      return res.status(HttpCode.UNAUTHORIZED).json({
        message: "Wrong password",
      });
    } else {
      // register user
      const salt = await bcrypt.genSalt(Number(SALT_FACTOR));
      const cryptedPassword = await bcrypt.hash(password, salt);
      const newUser = {
        username,
        password: cryptedPassword,
      };
      const createdUser = await model.create(newUser);
      return sendUserToken(res, createdUser);
    }
  } catch (e) {
    next(e);
  }
};

module.exports = {
  login,
};
