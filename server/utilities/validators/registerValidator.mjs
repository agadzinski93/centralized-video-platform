import Joi from "joi";

const registerValidator = Joi.object({
  username: Joi.string().min(3).max(24).required().messages({
    "string.base": "Username should be text",
    "string.min": "Username must be at least 3 characters",
    "string.max": "Username must be no more than 24 characters",
  }),
  email: Joi.string().max(45).required().messages({
    "string.max": "Email must be no more than 45 characters",
  }),
  password: Joi.string().min(3).max(24).required().messages({
    "string.min": "Password must be at least 3 characters",
    "string.max": "Password must be no more than 24 characters",
  }),
  repeat_password: Joi.ref("password")
});
export default registerValidator;