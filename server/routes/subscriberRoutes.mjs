import express from 'express'
import { verifyMethods } from '../utilities/validators/middleware/verifyMethods.mjs';
const router = express.Router({ caseSensitive: false, strict: false });
import { isLoggedIn } from '../utilities/validators/middleware/userAuth.mjs';
import { 
    subscribe,
    unsubscribe 
} from '../controllers/subscriberCont.mjs';

router.route('/')
    .post(isLoggedIn,subscribe)
    .delete(isLoggedIn,unsubscribe)
    .all(verifyMethods(['POST','DELETE']));

export {router};