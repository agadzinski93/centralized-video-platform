import express from 'express'
import { verifyMethods } from '../utilities/validators/middleware/verifyMethods';
import { setCache, setCors } from '../utilities/validators/middleware/setHeaders';
const router = express.Router({ caseSensitive: false, strict: false });
import {
  renderLibaryTopic,
  renderVideoPage
} from '../controllers/libraryCont';

router.route('/:topic')
  .get(setCors(), setCache, renderLibaryTopic)
  .all(verifyMethods(['GET']));

router.route('/:topic/:video')
  .get(setCors(), setCache, renderVideoPage)
  .all(verifyMethods(['GET']))

export { router };
