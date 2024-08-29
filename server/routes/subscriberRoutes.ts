import express from 'express'
import { verifyMethods } from '../utilities/validators/middleware/verifyMethods';
const router = express.Router({ caseSensitive: false, strict: false });
import { isLoggedIn } from '../utilities/validators/middleware/userAuth';
import {
    subscribe,
    unsubscribe
} from '../controllers/subscriberCont';

router.route('/:username')
    .post(isLoggedIn, subscribe)
    .delete(isLoggedIn, unsubscribe)
    .all(verifyMethods(['POST', 'DELETE']));

export { router };