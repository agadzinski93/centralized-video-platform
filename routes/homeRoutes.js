const express = require('express');
const router = express.Router({caseSensitive:false, strict:false});
const {renderHome, renderSearch, getMoreResults} = require('../controllers/homeCont');

router.get('/', renderHome);

router.route('/search')
    .get(renderSearch)
    .post(getMoreResults);

module.exports = router;