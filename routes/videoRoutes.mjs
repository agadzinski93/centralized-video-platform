import express from 'express'
const router = express.Router();
import { isLoggedIn,isAuthor } from '../utilities/userAuth.mjs';
import { 
    createVideo,
    editVideo,
    swapVideos,
    refreshMetadata,
    deleteVideo,
    deleteSelectedVideos
} from '../controllers/videosCont.mjs';

router.post('/:username/:topic/create', isLoggedIn, isAuthor, createVideo);

router.post('/:username/:topic/:video/edit', isLoggedIn, isAuthor, editVideo);

router.post('/:username/swapVideos', isLoggedIn, isAuthor, swapVideos);

router.put('/:username/refreshMetadata', isLoggedIn, isAuthor, refreshMetadata);

router.post("/:username/:topic/:video/delete", isLoggedIn, isAuthor, deleteVideo);

router.delete("/:username/deleteSelected", isLoggedIn, isAuthor, deleteSelectedVideos);

export {router};