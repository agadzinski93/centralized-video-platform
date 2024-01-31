import express from 'express'
import { verifyMethods } from '../utilities/validators/middleware/verifyMethods.mjs';
const router = express.Router({ caseSensitive: false, strict: false });
import { registrationValidation } from '../utilities/validators/middleware/validators.mjs';
import { 
  renderLogin,
  login,
  loginUser,
  logout,
  logoutUser,
  renderRegistration,
  registerUser,
  verifyEmail
} from '../controllers/userAuthCont.mjs';

router.route('/login')
  .get(renderLogin)
  .post(loginUser)
  .all(verifyMethods(['GET','POST']));

router.route('/loginUser')
  .post(login)
  .all(verifyMethods(['POST']))

router.route('/logout')
  .get(logoutUser)
  .all(verifyMethods(['GET']));

router.route('/logoutUser')
  .post([logout])
  .all(verifyMethods(['POST']));

router.route('/register')
  .get(renderRegistration)
  .post(registrationValidation,registerUser)
  .all(verifyMethods(['GET','POST']));

router.route('/:userId/verify/:key')
  .get(verifyEmail)
  .all(verifyMethods(['GET']));

export {router};