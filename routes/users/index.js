var express = require('express');
var router = express.Router();
const ctrl = require("../../controllers/users");
const guard = require('../../helpers/guard');
// const upload = require("../../../helpers/uploads");

const {validateUser} = require('./validation');

router.post('/signup', validateUser, ctrl.reg);
router.post('/login', validateUser, ctrl.login);

module.exports = router;
