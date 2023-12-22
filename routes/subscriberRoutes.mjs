import express from 'express'
import { verifyMethods } from '../utilities/validators/middleware/verifyMethods.mjs';
const router = express.Router({ caseSensitive: false, strict: false });
import { isLoggedIn } from '../utilities/userAuth.mjs';
import { 
    subscribe,
    unsubscribe 
} from '../controllers/subscriberCont.mjs';

router.all('/',verifyMethods({
    POST:{
        pre: [isLoggedIn],
        cont: subscribe
    },
    DELETE: {
        pre: [isLoggedIn],
        cont: unsubscribe
    }
}));

export {router};