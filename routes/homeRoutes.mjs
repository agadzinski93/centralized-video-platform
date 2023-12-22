import express from 'express';
import { verifyMethods } from '../utilities/validators/middleware/verifyMethods.mjs';
const router = express.Router({caseSensitive:false, strict:false});
import { 
    renderHome,
    renderSearch,
    getMoreResults
} from '../controllers/homeCont.mjs';

router.all('/', verifyMethods({
    GET:{
        cont: renderHome
    }
}));

router.all('/search',verifyMethods({
    GET:{
        cont: renderSearch
    },
    POST:{
        cont: getMoreResults
    }
}));

export {router};