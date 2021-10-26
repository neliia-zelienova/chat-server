const { Schema, model } = require("mongoose");

const messageSchema = new Schema(
  {
    text: {
      type: String,
      required: [true, "text is required"],
      index: true,
    },
    user: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { versionKey: false, timestamps: true }
);

const Message = model("Message", messageSchema);

module.exports = Message;
