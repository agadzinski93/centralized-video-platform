import Joi from "joi";

const registerUsernameValidator = Joi.object({
    username: Joi.string().min(3).max(24).required().messages({
        "string.base": "Username should be text",
        "string.min": "Username must be at least 3 characters",
        "string.max": "Username must be no more than 24 characters",
    }),
    email: Joi.string().max(45).required().messages({
        "string.max": "Email must be no more than 45 characters",
    }),
    google_id: Joi.string().min(3).max(24).required().messages({
        "string.base": "Google ID required.",
    }),
});
export default registerUsernameValidator;