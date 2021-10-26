const { Message, User } = require("../../models");

const HISTORY_MESSAGES_COUNT = 20;

const create = async ({ text, userId }) => {
  const data = await Message.create({
    text,
    userId,
  });
  const user = await Message.findOne({ where: { id: data.id }, include: User });
  return user;
};

const historyMessages = async () => {
  const count = await Message.count();
  const offset =
    count < HISTORY_MESSAGES_COUNT ? 0 : count - HISTORY_MESSAGES_COUNT;
  const messages = await Message.findAll({
    include: User,
    offset,
    limit: HISTORY_MESSAGES_COUNT,
  });
  return messages;
};

module.exports = {
  create,
  historyMessages,
};
