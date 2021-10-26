var express = require("express");
var router = express.Router();
const ctrl = require("../../controllers/routes/users");

const { validateUser } = require("./validation");

router.post("/login", validateUser, ctrl.login);

module.exports = router;
