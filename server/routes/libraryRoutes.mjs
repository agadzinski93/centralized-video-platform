import express from 'express'
import { verifyMethods } from '../utilities/validators/middleware/verifyMethods.mjs';
import { setCache,setCors } from '../utilities/validators/middleware/setHeaders.mjs';
const router = express.Router({ caseSensitive: false, strict: false });
import {
  renderLibaryTopic,
  renderVideoPage 
} from '../controllers/libraryCont.mjs';

router.route('/:topic')
  .get(setCors(),setCache,renderLibaryTopic)
  .all(verifyMethods(['GET']));

router.route('/:topic/:video')
  .get(setCors(),setCache,renderVideoPage)
  .all(verifyMethods(['GET']))

export {router};
