import express from 'express'
import { verifyMethods } from '../utilities/validators/middleware/verifyMethods.mjs';
const router = express.Router({ caseSensitive: false, strict: false });
import passport from 'passport';
import { 
    subscribe,
    unsubscribe 
} from '../controllers/subscriberCont.mjs';

router.route('/')
    .post(passport.authenticate('cookie',{session:false}),subscribe)
    .delete(passport.authenticate('cookie',{session:false}),unsubscribe)
    .all(verifyMethods(['POST','DELETE']));

export {router};