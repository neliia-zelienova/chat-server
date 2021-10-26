const { Message, User } = require("../../models");
const { getColor } = require("../../helpers/color-picker");

const findById = async (id) => {
  const data = await User.findOne({
    where: { id: id },
    attributes: [
      "username",
      "muted",
      "banned",
      "online",
      "admin",
      "color",
      "id",
    ],
  });
  return data;
};

const newMesageAllowed = async (id) => {
  const { dataValues } = await User.findOne({
    where: { id: id },
    include: Message,
  });
  if (dataValues.Messages.length) {
    const lastMessageAt = new Date(
      dataValues.Messages[dataValues.Messages.length - 1].dataValues.createdAt
    );
    const currentTine = new Date();
    return currentTine - lastMessageAt > 15000;
  }
  return true;
};

const findByUsername = async (username) => {
  const data = User.scope("withPassword").findOne({
    where: { username: username },
  });
  return data;
};

const create = async (options) => {
  const color = getColor(44, 153);
  return await User.create({ ...options, color });
};

const toggleMute = async (id) => {
  const { muted } = await User.findOne({
    where: { id: id },
  });
  return User.update(
    { muted: !muted },
    {
      where: { id: id },
    }
  );
};

const toggleBan = async (id) => {
  const { banned } = await User.findOne({
    where: { id: id },
  });
  return User.update(
    { banned: !banned },
    {
      where: { id: id },
    }
  );
};

const onlineUsers = () => {
  return User.findAll({
    where: { online: true },
    attributes: [
      "username",
      "muted",
      "banned",
      "online",
      "admin",
      "color",
      "id",
    ],
  });
};

const allUsers = () => {
  return User.findAll({
    attributes: [
      "username",
      "muted",
      "banned",
      "online",
      "admin",
      "color",
      "id",
    ],
  });
};

const toggleOnline = async (id, online) => {
  return User.update(
    { online: online },
    {
      where: { id: id },
    }
  );
};

const getAdmin = () => {
  return User.findOne({
    where: { admin: true },
    attributes: [
      "username",
      "muted",
      "banned",
      "online",
      "admin",
      "color",
      "id",
    ],
  });
};

module.exports = {
  findById,
  findByUsername,
  newMesageAllowed,
  create,
  onlineUsers,
  allUsers,
  toggleMute,
  toggleBan,
  toggleOnline,
  getAdmin,
};
