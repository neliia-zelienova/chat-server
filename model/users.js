const User = require("./schemas/user");

const findById = (id) => {
  return User.findOne({ _id: id });
};

const findByUsername = (username) => {
  return User.findOne({ username });
};

const findByToken = (token) => {
  return User.findOne({ token }).select(
    "-password -createdAt -updatedAt -token"
  );
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

const toggleMute = async (id) => {
  const { muted } = await User.findOne({ _id: id });
  console.log("toggleMute", muted);
  return User.updateOne({ _id: id }, { muted: !muted });
};

const toggleBun = async (id) => {
  const { bunned } = await User.findOne({ _id: id });
  return User.updateOne({ _id: id }, { bunned: !bunned });
};

const onlineUsers = () => {
  return User.find({ online: true }).select(
    "-password -createdAt -updatedAt -token"
  );
};

const allUsers = () => {
  return User.find().select("-password -createdAt -updatedAt -token");
};

const toggleOnline = (id, online) => {
  return User.updateOne({ _id: id }, { online });
};

const getAdmin = () => {
  return User.findOne({ admin: true });
};

module.exports = {
  findById,
  findByUsername,
  findByToken,
  create,
  updateToken,
  updateAvatar,
  onlineUsers,
  allUsers,
  toggleMute,
  toggleBun,
  toggleOnline,
  getAdmin,
};
