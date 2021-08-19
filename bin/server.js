const app = require("../app");
const db = require("../model/db");
const http = require("http").createServer(app);
const io = require("socket.io")(http, { cors: { origin: "*" } });

require("dotenv").config();
require("../services/sockets")(io);

const PORT = process.env.PORT || 3001;

db.then(() => {
  http.listen(PORT, async () => {
    console.log("Database connection successful");
  });
}).catch((err) => {
  console.log(`Error while connecting database: ${err}`);
  process.exit(1);
});
