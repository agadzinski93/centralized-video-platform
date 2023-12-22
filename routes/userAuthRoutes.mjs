import express from 'express'
import { verifyMethods } from '../utilities/validators/middleware/verifyMethods.mjs';
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

router.all('/login', verifyMethods({
  GET:{
    cont: renderLogin
  },
  POST: {
    cont: loginUser
  }
}));

router.all('/logout', verifyMethods({
  GET:{
    cont: logoutUser
  }
}));

router.all('/register', verifyMethods({
  GET:{
    cont: renderRegistration
  },
  POST: {
    pre: [registrationValidation],
    cont: registerUser
  }
}));

router.all('/:userId/verify/:key',verifyMethods({
  GET:{
    cont: verifyEmail
  }
}));

export {router};