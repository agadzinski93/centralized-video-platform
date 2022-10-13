const Joi = require("joi");

module.exports = Joi.object({
  topic: Joi.object({
    name: Joi.string().min(3).max(45).required().messages({
      "string.min": "Title must be at least 3 characters",
      "string.max": "Title must be no more than 45 characters",
    }),
    description: Joi.string().min(3).max(512).required().messages({
      "string.min": "Description must be at least 3 characters",
      "string.max": "Description must be no more than 512 characters",
    }),
    difficulty: Joi.string()
      .required()
      .valid("Beginner", "Intermediate", "Advanced")
      .messages({ "string.base": "Difficulty must be text" }),
  }).required(),
});
