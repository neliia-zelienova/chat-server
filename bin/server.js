const app = require("../app");
const db = require("../db.js");
const http = require("http").createServer(app);
const io = require("socket.io")(http, { cors: { origin: "*" } });

require("dotenv").config();
require("../services/sockets")(io);

const PORT = process.env.PORT || 3001;

const tryConnect = async (db) => {
  try {
    await db.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

tryConnect(db);

http.listen(PORT, async () => {
  console.log("Database connection successful");
});
