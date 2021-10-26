const Message = require("./schemas/message");
const User = require("./schemas/user");

const HISTORY_MESSAGES_COUNT = 20;

const create = async ({ text, user }) => {
  const message = new Message({ text, user: user._id });
  const messageSaved = await message.save();
  await User.findByIdAndUpdate(
    user._id,
    { $push: { messages: message._id } },
    { new: true, useFindAndModify: false }
  );
  const returnData = await Message.findOne({ text }).populate(
    "user",
    "username color"
  );
  return returnData;
};

const historyMessages = async () => {
  return await Message.find()
    .sort("-date")
    .populate("user", "username color")
    .limit(HISTORY_MESSAGES_COUNT);
};

module.exports = {
  create,
  historyMessages,
};
