import express from 'express';
import { verifyMethods } from '../utilities/validators/middleware/verifyMethods.mjs';
const router = express.Router({caseSensitive:false, strict:false});
import { 
    renderHome,
    renderSearch,
    getMoreResults
} from '../controllers/homeCont.mjs';

router.route('/')
    .get(renderHome)
    .all(verifyMethods(['GET']));

router.route('/search')
    .get(renderSearch)
    .post(getMoreResults)
    .all(verifyMethods(['GET','POST']));


export {router};