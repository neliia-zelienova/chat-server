const gravatar = require("gravatar");
const { Schema, model } = require("mongoose");
const bcrypt = require("bcryptjs");
const { nanoid } = require("nanoid");

const SALT_FACTOR = 6;

const userSchema = new Schema(
  {
    admin: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      validate(value) {
        const re = /\S+@\S+.\S+/gi;
        return re.test(String(value).toLowerCase());
      },
    },
    muted: {
      type: Boolean,
      default: false,
    },
    blocked: {
      type: Boolean,
      default: false,
    },
    token: {
      type: String,
      default: null,
    },
    avatarURL: {
      type: String,
      default: function () {
        return gravatar.url(this.email, { s: 250 }, true);
      },
    },
  },
  { versionKey: false, timestamps: true }
);

userSchema.path("email").validate((value) => {
  const regEx = /\S+@\S+.\S+/gi;
  return regEx.test(String(value));
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(SALT_FACTOR);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

userSchema.methods.validPassword = async function (password) {
  return await bcrypt.compare(String(password), this.password);
};

const User = model("user", userSchema);

module.exports = User;