import express from 'express'
import { verifyMethods } from '../utilities/validators/middleware/verifyMethods.mjs';
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

router.route('/:username/:topic/create')
    .post(isLoggedIn,isAuthor,createVideo)
    .all(verifyMethods(['POST']));

router.route('/:username/:topic/:video/edit')
    .post(isLoggedIn,isAuthor,editVideo)
    .all(verifyMethods(['POST']));

router.route('/:username/swapVideos')
    .post(isLoggedIn,isAuthor,swapVideos)
    .all(verifyMethods(['POST']));

router.route('/:username/refreshMetadata')
    .put(isLoggedIn,isAuthor,refreshMetadata)
    .all(verifyMethods(['PUT']));

router.route('/:username/:topic/:video/delete')
    .post(isLoggedIn,isAuthor,deleteVideo)
    .all(verifyMethods(['POST']));

router.route('/:username/deleteSelected')
    .delete(isLoggedIn,isAuthor,deleteSelectedVideos)
    .all(verifyMethods(['DELETE']));

export {router};