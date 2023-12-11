import express from 'express'
const router = express.Router({ caseSensitive: false, strict: false });
import { isLoggedIn } from '../utilities/userAuth.mjs';
import { 
    subscribe,
    unsubscribe 
} from '../controllers/subscriberCont.mjs';

router.route("/")
    .post(isLoggedIn,subscribe)
    .delete(isLoggedIn,unsubscribe);

export {router};