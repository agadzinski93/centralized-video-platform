import express from 'express'
import { verifyMethods } from '../utilities/validators/middleware/verifyMethods';
import { setCache } from '../utilities/validators/middleware/setHeaders';
const router = express.Router({ caseSensitive: false, strict: false });
import {
  renderLibaryTopic,
  renderTopicScreen,
  renderVideoPage,
  renderVideoScreen
} from '../controllers/libraryCont';

router.route('/:topic')
  .get(setCache, renderLibaryTopic)
  .all(verifyMethods(['GET']));

router.route('/:topic/renderTopicScreen')
  .get(setCache, renderTopicScreen)
  .all(verifyMethods(['GET']));

router.route('/:topic/:video')
  .get(setCache, renderVideoPage)
  .all(verifyMethods(['GET']));

router.route('/:topic/:video/renderVideoScreen')
  .get(setCache, renderVideoScreen)
  .all(verifyMethods(['GET']));

export { router };
