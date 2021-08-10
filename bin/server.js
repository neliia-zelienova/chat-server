const app = require("../app");
const db = require("../model/db");
const http = require("http").createServer(app);
const io = require("socket.io")(http, { cors: { origin: "*" } });
const jwt = require("jsonwebtoken");
const createFolder = require("../helpers/create-dir");

const Users = require("../model/users");

require("dotenv").config();

const PORT = process.env.PORT || 3001;

require("../services/sockets")(io);

// const UPLOAD_DIR = process.env.UPLOAD_DIR;
// const USERS_AVATARS = process.env.USERS_AVATARS;

db.then(() => {
  http.listen(PORT, async () => {
    // await createFolder(UPLOAD_DIR);
    // await createFolder(USERS_AVATARS);
    console.log("Database connection successful");
  });
}).catch((err) => {
  console.log(`Error while connecting database: ${err}`);
  process.exit(1);
});
