import express from 'express';
import { verifyMethods } from '../utilities/validators/middleware/verifyMethods';
import { setCache } from '../utilities/validators/middleware/setHeaders';
const router = express.Router({ caseSensitive: false, strict: false });
import {
    renderHome,
    renderHomeScreen,
    renderSearch,
    getMoreResults,
    renderSearchScreen
} from '../controllers/homeCont';

router.route('/')
    .get(setCache, renderHome)
    .all(verifyMethods(['GET']));

router.route('/home')
    .get(setCache, renderHomeScreen)
    .all(verifyMethods(['GET']));

router.route('/search')
    .get(setCache, renderSearch)
    .post(getMoreResults)
    .all(verifyMethods(['GET', 'POST']));

router.route('/renderSearchScreen')
    .get(setCache, renderSearchScreen)
    .all(verifyMethods(['GET']));

export { router };