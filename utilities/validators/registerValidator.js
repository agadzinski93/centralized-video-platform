const Joi = require("joi");

module.exports = Joi.object({
  reg: Joi.object({
    username: Joi.string().min(3).max(24).required().messages({
      "string.base": "username should be text",
      "string.min": "username must be at least 3 characters",
      "string.max": "username must be no more than 24 characters",
    }),
    email: Joi.string().max(45).required().messages({
      "string.max": "email must be no more than 45 characters",
    }),
    password: Joi.string().min(3).max(24).required().messages({
      "string.min": "password must be at least 3 characters",
      "string.max": "password must be no more than 24 characters",
    }),
    repeat_password: Joi.ref("password"),
  }).required(),
});
