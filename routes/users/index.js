var express = require("express");
var router = express.Router();
const ctrl = require("../../controllers/users");
const guard = require("../../helpers/guard");

const { validateUser } = require("./validation");

router.post("/login", validateUser, ctrl.login);
router.post("/logout", guard, ctrl.logout);

module.exports = router;
