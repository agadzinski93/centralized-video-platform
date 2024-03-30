import express from 'express';
import { apiRouter } from './apiRoute.mjs';
import { verifyMethods } from '../utilities/validators/middleware/verifyMethods.mjs';
import { setCache,setCors } from '../utilities/validators/middleware/setHeaders.mjs';
const router = express.Router({caseSensitive:false, strict:false});
import { 
    renderHome,
    renderHomeScreen,
    renderSearch,
    getMoreResults
} from '../controllers/homeCont.mjs';

router.route('/')
    .get(setCors(),setCache,renderHome)
    .all(verifyMethods(['GET']));

router.route('/home')
    .get(setCors(),setCache,renderHomeScreen)
    .all(verifyMethods(['GET']));

router.route('/search')
    .get(setCors(),setCache,renderSearch)
    .post(getMoreResults)
    .all(verifyMethods(['GET','POST']));

export {router};