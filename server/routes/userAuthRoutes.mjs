import express from 'express'
import { verifyMethods } from '../utilities/validators/middleware/verifyMethods.mjs';
import { isLoggedInOptional } from '../utilities/validators/middleware/userAuth.mjs';
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

router.route('/login')
  .get(isLoggedInOptional,renderLogin)
  .post(loginUser)
  .all(verifyMethods(['GET','POST']));

router.route('/logout')
  .get(isLoggedInOptional,logoutUser)
  .all(verifyMethods(['GET']));

router.route('/register')
  .get(isLoggedInOptional,renderRegistration)
  .post(registrationValidation,registerUser)
  .all(verifyMethods(['GET','POST']));

router.route('/:userId/verify/:key')
  .get(isLoggedInOptional,verifyEmail)
  .all(verifyMethods(['GET']));

export {router};