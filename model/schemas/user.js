const { Schema, model } = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const SALT_FACTOR = process.env.SALT_FACTOR;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      index: true,
      unique: true,
      validate(value) {
        const regex = /[A-Za-z0-9]{3,}/;
        return regex.test(String(value).toLowerCase());
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      validate(value) {
        const regex =
          /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/;
        return regex.test(String(value).toLowerCase());
      },
    },
    admin: {
      type: Boolean,
      default: false,
    },
    online: {
      type: Boolean,
      default: false,
    },
    muted: {
      type: Boolean,
      default: false,
    },
    banned: {
      type: Boolean,
      default: false,
    },
    token: {
      type: String,
      default: null,
    },
    color: {
      type: String,
      default: "000000",
    },
    messages: [{ type: Schema.Types.ObjectId, ref: "Message" }],
  },
  { versionKey: false, timestamps: true }
);

userSchema.path("username").validate((value) => {
  const regEx = /[A-Za-z0-9]{3,}/;
  return regEx.test(String(value));
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(Number(SALT_FACTOR));
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

userSchema.methods.validPassword = async function (password) {
  return await bcrypt.compare(String(password), this.password);
};

const User = model("User", userSchema);

module.exports = User;
