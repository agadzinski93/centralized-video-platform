import express from 'express'
import { processValidation } from '../utilities/validators/middleware/userAuth';
import { verifyMethods } from '../utilities/validators/middleware/verifyMethods';
const router = express.Router({ caseSensitive: false, strict: false });
import { registrationValidation, registerUsernameValidation } from '../utilities/validators/middleware/validators';
import passport from 'passport';
import {
  renderLogin,
  login,
  loginUser,
  loginApiUser,
  getUserCredentials,
  logout,
  logoutUser,
  renderRegistration,
  register,
  registerUser,
  verifyEmail,
  verifyEmailAccount,
  registerUserGoogle,
  userExists
} from '../controllers/userAuthCont';

const FAILURE_REDIRECT = '/auth/login/';

router.route('/login')
  .get(renderLogin)
  .post(login)
  .all(verifyMethods(['GET', 'POST']));

router.route('/loginUser')
  .post(loginUser)
  .all(verifyMethods(['POST']))

router.route('/api/login')
  .post(loginApiUser)
  .all(verifyMethods(['POST']));

router.route('/login/google')
  .get(passport.authenticate('google', { scope: ["email", "profile"] }))
  .all(verifyMethods(['GET']));

router.route('/google/callback')
  .get(passport.authenticate('google', { failureRedirect: FAILURE_REDIRECT }), processValidation)
  .all(verifyMethods(['GET']));

router.route('/getCredentials')
  .get(getUserCredentials)
  .all(verifyMethods(['GET']));

router.route('/logout')
  .get(logout)
  .all(verifyMethods(['GET']));

router.route('/logoutUser')
  .post(logoutUser)
  .all(verifyMethods(['POST']));

router.route('/register')
  .get(renderRegistration)
  .post(registrationValidation, register)
  .all(verifyMethods(['GET', 'POST']));

router.route('/registerUser')
  .post(registerUser)
  .all(verifyMethods(['POST']));

router.route('/register/google')
  .post(registerUsernameValidation, registerUserGoogle)
  .all(verifyMethods(['POST']));

router.route('/:userId/verify/:key')
  .get(verifyEmail)
  .all(verifyMethods(['GET']));

router.route('/:userId/verifyEmail/:key')
  .get(verifyEmailAccount)
  .all(verifyMethods(['GET']));

router.route('/usernameExists')
  .post(userExists)
  .all(verifyMethods(['POST']));

export { router };