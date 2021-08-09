const User = require("./schemas/user");

const findById = (id) => {
  return User.findOne({ _id: id });
};

const findByEmail = async (email) => {
  return User.findOne({ email });
};



const create = async (options) => {
  const count = await User.countDocuments();
  let admin = false;
  if (count === 0) admin = true;
  const user = new User({...options, admin});
  return await user.save();
};

const updateToken = (id, token) => {
  return User.updateOne({ _id: id }, { token });
};

const updateAvatar = (id, avatarURL) => {
  return User.updateOne({ _id: id }, { avatarURL });
};

const findByVerifyToken = (verifyToken) => {
  return User.findOne({ verifyToken });
};

const updateVefiryToken = (id, verifyToken, verify) => {
  return User.updateOne({ _id: id }, { verifyToken, verify });
};

module.exports = {
  findById,
  findByEmail,
  create,
  updateToken,
  updateAvatar,
  findByVerifyToken,
  updateVefiryToken,
};
