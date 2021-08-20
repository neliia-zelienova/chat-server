const Users = require("../model/users");
const jwt = require("jsonwebtoken");

require("dotenv").config();
const { HttpCode } = require("../helpers/constants");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const sendUserToken = async (Collection, res, user) => {
  const { _id, username, admin, banned, online, muted } = user;
  const payload = { id: _id };
  const token = jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: "2h" });
  await Collection.updateToken(_id, token);
  return res.status(HttpCode.OK).json({
    data: { _id, username, admin, banned, online, muted, token },
  });
};

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await Users.findByUsername(username);
    // Register user if not exist
    if (!user) {
      const newUser = await Users.create(req.body);

      return sendUserToken(Users, res, newUser);
    }
    // Check password
    const isValidPassword = await user?.validPassword(password);
    if (!user || !isValidPassword) {
      return res.status(HttpCode.UNAUTHORIZED).json({
        message: "Username or password is wrong",
      });
    } else {
      return sendUserToken(Users, res, user);
    }
  } catch (e) {
    next(e);
  }
};

const logout = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(HttpCode.UNAUTHORIZED).json({
        message: "Not authorized",
      });
    }

    await Users.updateToken(user.id, null);
    return res.status(HttpCode.OK).json();
  } catch (e) {
    next(e);
  }
};

module.exports = {
  login,
  logout,
};
