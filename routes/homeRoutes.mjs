import express from 'express';
import { verifyMethods } from '../utilities/validators/middleware/verifyMethods.mjs';
import { setHeaders } from '../utilities/validators/middleware/setHeaders.mjs';
const router = express.Router({caseSensitive:false, strict:false});
import { 
    renderHome,
    renderSearch,
    getMoreResults
} from '../controllers/homeCont.mjs';

router.route('/')
    .get(setHeaders,renderHome)
    .all(verifyMethods(['GET']));

router.route('/search')
    .get(setHeaders,renderSearch)
    .post(getMoreResults)
    .all(verifyMethods(['GET','POST']));


export {router};