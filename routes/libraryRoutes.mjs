import express from 'express'
import { verifyMethods } from '../utilities/validators/middleware/verifyMethods.mjs';
import { setHeaders } from '../utilities/validators/middleware/setHeaders.mjs';
const router = express.Router({ caseSensitive: false, strict: false });
import {
  renderLibaryTopic,
  renderVideoPage 
} from '../controllers/libraryCont.mjs';

router.route('/:topic')
  .get(setHeaders,renderLibaryTopic)
  .all(verifyMethods(['GET']));

router.route('/:topic/:video')
  .get(setHeaders,renderVideoPage)
  .all(verifyMethods(['GET']))

export {router};
