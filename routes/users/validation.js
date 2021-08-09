const Joi = require("joi");

const emailPattern = /\S+@\S+.\S+/;

const schemaUser = Joi.object({
  email: Joi.string()
    .regex(emailPattern)
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net", "uk"] },
    })
    .required(),
  password: Joi.string().required(),
  admin: Joi.boolean().optional(),
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
  return validate(schemaUser, req.body, next);
};


module.exports = { validateUser };