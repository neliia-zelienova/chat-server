const Joi = require("joi");

const userNamePattern = /[A-Za-z0-9]{3,}/;

const schemaLoginUser = Joi.object({
  username: Joi.string().regex(userNamePattern).required(),
  password: Joi.string().required(),
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
