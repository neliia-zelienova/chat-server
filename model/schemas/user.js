// const gravatar = require("gravatar");
const { Schema, model } = require("mongoose");
const bcrypt = require("bcryptjs");
// const { nanoid } = require("nanoid");

const SALT_FACTOR = 6;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      index: true,
      unique: true,
      // validate(value) {
      //   const regex = /[A-Za-z0-9]{3,}/;
      //   return regex.test(String(value).toLowerCase());
      // },
    },
    // email: {
    //   type: String,
    //   required: [true, "Email is required"],
    //   unique: true,
    //   validate(value) {
    //     const re = /\S+@\S+.\S+/gi;
    //     return re.test(String(value).toLowerCase());
    //   },
    // },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    admin: {
      type: Boolean,
      default: false,
    },
    online: {
      type: Boolean,
      default: false,
    },
    mutted: {
      type: Boolean,
      default: false,
    },
    bunned: {
      type: Boolean,
      default: false,
    },
    token: {
      type: String,
      default: null,
    },
    // avatarURL: {
    //   type: String,
    //   default: function () {
    //     return gravatar.url(this.email, { s: 250 }, true);
    //   },
    // },
  },
  { versionKey: false, timestamps: true }
);

userSchema.path("username").validate((value) => {
  const regEx = /[A-Za-z0-9]{3,}/;
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
