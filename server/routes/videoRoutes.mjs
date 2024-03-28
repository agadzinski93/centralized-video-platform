import express from 'express'
import { verifyMethods } from '../utilities/validators/middleware/verifyMethods.mjs';
const router = express.Router();
import { isLoggedIn,isAuthor } from '../utilities/validators/middleware/userAuth.mjs';
import { 
    createVideo,
    editVideo,
    swapVideos,
    refreshMetadata,
    deleteVideo,
    deleteSelectedVideos
} from '../controllers/videosCont.mjs';

router.route('/:username/:topic/create')
    .post(isLoggedIn,isAuthor,createVideo)
    .all(verifyMethods(['POST']));

router.route('/:username/:topic/:video')
    .put(isLoggedIn,isAuthor,editVideo)
    .delete(isLoggedIn,isAuthor,deleteVideo)
    .all(verifyMethods(['PUT','DELETE']));

router.route('/:username/swapVideos')
    .put(isLoggedIn,isAuthor,swapVideos)
    .all(verifyMethods(['PUT']));

router.route('/:username/refreshMetadata')
    .put(isLoggedIn,isAuthor,refreshMetadata)
    .all(verifyMethods(['PUT']));

router.route('/:username/deleteSelected')
    .delete(isLoggedIn,isAuthor,deleteSelectedVideos)
    .all(verifyMethods(['DELETE']));

export {router};