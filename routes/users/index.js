var express = require("express");
var router = express.Router();
const ctrl = require("../../controllers/users");
const guard = require("../../helpers/guard");
// const upload = require("../../../helpers/uploads");

const { validateUser } = require("./validation");

// router.options("/login", () => console.log("options"));
router.post("/login", validateUser, ctrl.login);
router.post("/logout", guard, ctrl.logout);
// router.options("/", () => console.log("options"));
// router.get("/", guard, ctrl.current);

module.exports = router;
