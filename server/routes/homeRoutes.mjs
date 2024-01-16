import express from 'express';
import { verifyMethods } from '../utilities/validators/middleware/verifyMethods.mjs';
import { setHeaders } from '../utilities/validators/middleware/setHeaders.mjs';
import { isLoggedInOptional } from '../utilities/validators/middleware/userAuth.mjs';
const router = express.Router({caseSensitive:false, strict:false});
import { 
    renderHome,
    renderHomeScreen,
    renderSearch,
    getMoreResults
} from '../controllers/homeCont.mjs';

router.route('/')
    .get(isLoggedInOptional,setHeaders,renderHome)
    .all(verifyMethods(['GET']));

router.route('/home')
    .get(isLoggedInOptional,setHeaders,renderHomeScreen)
    .all(verifyMethods(['GET']));

router.route('/search')
    .get(isLoggedInOptional,setHeaders,renderSearch)
    .post(getMoreResults)
    .all(verifyMethods(['GET','POST']));


export {router};