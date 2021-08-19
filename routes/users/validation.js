const Joi = require("joi");

const usernamePattern = /[A-Za-z0-9]{3,}/;
const passwordPattern =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/;

const schemaLoginUser = Joi.object({
  username: Joi.string().regex(usernamePattern).required(),
  password: Joi.string().regex(passwordPattern).min(6).max(30).required(),
});

const validate = async (schema, body, next) => {
  try {
    await schema.validateAsync(body);
    next();
  } catch (err) {
    next({ status: 400, message: `Field ${err.message.replace(/"/g, "")}` });
  }
};

const validateUser = (req, _res, next) => {
  return validate(schemaLoginUser, req.body, next);
};

module.exports = { validateUser };
