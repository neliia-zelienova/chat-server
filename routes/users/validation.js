const Joi = require("joi");

const emailPattern = /\S+@\S+.\S+/;
const userNamePattern = /[A-Za-z0-9]{3,}/;

const schemaSignupUser = Joi.object({
  username: Joi.string().regex(userNamePattern).required(),
  email: Joi.string()
    .regex(emailPattern)
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net", "uk"] },
    })
    .required(),
  password: Joi.string().required(),
});

const schemaLoginUser = Joi.object({
  email: Joi.string()
    .regex(emailPattern)
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net", "uk"] },
    })
    .required(),
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

const validateSignupUser = (req, _res, next) => {
  return validate(schemaSignupUser, req.body, next);
};

const validateLoginUser = (req, _res, next) => {
  return validate(schemaLoginUser, req.body, next);
};

module.exports = { validateSignupUser, validateLoginUser };
