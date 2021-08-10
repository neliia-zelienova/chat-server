const User = require("./schemas/user");

const findById = (id) => {
  return User.findOne({ _id: id });
};

const findByEmail = (email) => {
  return User.findOne({ email });
};

const findByToken = (token) => {
  return User.findOne({ token });
};

const create = async (options) => {
  const count = await User.countDocuments();
  let admin = false;
  if (count === 0) admin = true;
  const user = new User({ ...options, admin });
  return await user.save();
};

const updateToken = (id, token) => {
  return User.updateOne({ _id: id }, { token });
};

const updateAvatar = (id, avatarURL) => {
  return User.updateOne({ _id: id }, { avatarURL });
};

const toggleOnlineByToken = (token, online) => {
  return User.updateOne({ token }, { online });
};

const toggleMute = async (id) => {
  const { mutted } = await Users.findOne({ _id: id });
  return User.updateOne({ _id: id }, { mutted: !mutted });
};

const toggleBun = async (id) => {
  const { bunned } = await Users.findOne({ _id: id });
  return User.updateOne({ _id: id }, { bunned: !bunned });
};

const onlineUsers = () => {
  return User.find({ online: true });
};

const allUsers = () => {
  return User.find();
};

module.exports = {
  findById,
  findByEmail,
  findByToken,
  create,
  updateToken,
  updateAvatar,
  onlineUsers,
  allUsers,
  toggleOnlineByToken,
  toggleMute,
  toggleBun,
};
