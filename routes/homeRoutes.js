const express = require('express');
const router = express.Router({caseSensitive:false, strict:false});
const {renderHome, renderSearch} = require('../controllers/homeCont');

router.get('/', renderHome);

router.get('/search', renderSearch);

module.exports = router;