const Users = require("../model/users");
const jwt = require("jsonwebtoken");

require("dotenv").config();
const { HttpCode } = require("../helpers/constants");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await Users.findByUsername(username);
    // Register user if not exist
    if (!user) {
      const newUser = await Users.create(req.body);
      const { _id, username, avatarURL, admin, bunned, online, muted } =
        newUser;

      const token = jwt.sign({ id: newUser._id }, JWT_SECRET_KEY, {
        expiresIn: "2h",
      });

      await Users.updateToken(newUser?._id, token);
      return res.status(HttpCode.OK).json({
        status: "success",
        code: HttpCode.OK,
        data: {
          _id,
          username,
          avatarURL,
          admin,
          token,
          online,
          bunned,
          muted,
        },
      });
    }
    // Check password
    const isValidPassword = await user?.validPassword(password);
    if (!user || !isValidPassword) {
      return res.status(HttpCode.UNAUTHORIZED).json({
        status: "error",
        code: HttpCode.UNAUTHORIZED,
        message: "Username or password is wrong",
      });
    } else {
      const { _id, username, avatarURL, admin, bunned, online, muted } = user;
      const payload = { id: user.id };
      const token = jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: "2h" });
      await Users.updateToken(user.id, token);
      return res.status(HttpCode.OK).json({
        status: "success",
        code: HttpCode.OK,
        data: {
          _id,
          username,
          avatarURL,
          admin,
          token,
          online,
          bunned,
          muted,
        },
      });
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
        status: "error",
        code: HttpCode.UNAUTHORIZED,
        message: "Not authorized",
      });
    }

    await Users.updateToken(user.id, null);
    return res.status(HttpCode.OK).json({
      status: "success",
      code: HttpCode.OK,
    });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  login,
  logout,
};
