import express from 'express';
const router = express.Router({caseSensitive:false, strict:false});
import { 
    renderHome,
    renderSearch,
    getMoreResults
} from '../controllers/homeCont.mjs';
router.get('/', renderHome);

router.route('/search')
    .get(renderSearch)
    .post(getMoreResults);

export {router};