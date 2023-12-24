import express from 'express'
import { verifyMethods } from '../utilities/validators/middleware/verifyMethods.mjs';
const router = express.Router({ caseSensitive: false, strict: false });
import {
  renderLibaryTopic,
  renderVideoPage 
} from '../controllers/libraryCont.mjs';

router.route('/:topic')
  .get(renderLibaryTopic)
  .all(verifyMethods(['GET']));

router.route('/:topic/:video')
  .get(renderVideoPage)
  .all(verifyMethods(['GET']))

export {router};
