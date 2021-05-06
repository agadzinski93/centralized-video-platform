const express = require('express');
const router = express.Router();
const {isLoggedIn, isAuthor} = require('../utilities/userAuth');
const {createVideo, deleteVideo} = require("../controllers/videosCont");

router.post('/:username/:topic/create', isLoggedIn, isAuthor, createVideo);

router.post("/:username/:topic/:video/delete", isLoggedIn, isAuthor, deleteVideo);

module.exports = router;