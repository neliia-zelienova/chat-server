
const app = require("../app");
const db = require("../model/db");
const createFolder = require("../helpers/create-dir");
require("dotenv").config();

const PORT = process.env.PORT || 3001;

// const UPLOAD_DIR = process.env.UPLOAD_DIR;
// const USERS_AVATARS = process.env.USERS_AVATARS;

db.then(() => {
  app.listen(PORT, async () => {
    // await createFolder(UPLOAD_DIR);
    // await createFolder(USERS_AVATARS);
    console.log("Database connection successful");
  });
}).catch((err) => {
  console.log(`Error while connecting database: ${err}`);
  process.exit(1);
});