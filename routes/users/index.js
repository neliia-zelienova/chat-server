var express = require("express");
var router = express.Router();
const ctrl = require("../../controllers/users");
const guard = require("../../helpers/guard");
// const upload = require("../../../helpers/uploads");

const { validateSignupUser, validateLoginUser } = require("./validation");
// TODO delete signup - fast registration
router.post("/signup", validateSignupUser, ctrl.registartion);
router.post("/login", validateLoginUser, ctrl.login);
router.post("/logout", guard, ctrl.logout);
router.get("/", guard, ctrl.current);

module.exports = router;
