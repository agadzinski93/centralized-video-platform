import express from 'express'
const router = express.Router({ caseSensitive: false, strict: false });
import { registrationValidation } from '../utilities/validators/middleware/validators.mjs';
import { 
  renderLogin,
  loginUser,
  logoutUser,
  renderRegistration,
  registerUser,
  verifyEmail
} from '../controllers/userAuthCont.mjs';

router.route("/login").get(renderLogin).post(loginUser);
router.get("/logout", logoutUser);
router
  .route("/register")
  .get(renderRegistration)
  .post(registrationValidation, registerUser);
router.get("/:userId/verify/:key",verifyEmail);

export {router};