const express = require('express');
const router = express.Router();
const {isLoggedIn, isAuthor} = require('../utilities/userAuth');
const {createVideo, editVideo, swapVideos, deleteVideo, deleteSelectedVideos} = require("../controllers/videosCont");

router.post('/:username/:topic/create', isLoggedIn, isAuthor, createVideo);

router.post('/:username/:topic/:video/edit', isLoggedIn, isAuthor, editVideo);

router.post('/:username/swapVideos', isLoggedIn, isAuthor, swapVideos);

router.post("/:username/:topic/:video/delete", isLoggedIn, isAuthor, deleteVideo);

router.delete("/:username/deleteSelected", isLoggedIn, isAuthor, deleteSelectedVideos);

module.exports = router;