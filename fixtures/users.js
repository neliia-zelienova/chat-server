const { ObjectID: ObjectId } = require("mongodb");

module.exports = [
  {
    _id: ObjectId(),
    username: "admin",
    password: "",
    admin: true,
    online: false,
    muted: false,
    banned: false,
    token: null,
    color: "000000",
  },
];
