import express from 'express'
import { verifyMethods } from '../utilities/validators/middleware/verifyMethods.mjs';
import { setHeaders } from '../utilities/validators/middleware/setHeaders.mjs';
import { isLoggedInOptional } from '../utilities/validators/middleware/userAuth.mjs';
const router = express.Router({ caseSensitive: false, strict: false });
import {
  renderLibaryTopic,
  renderVideoPage 
} from '../controllers/libraryCont.mjs';

router.route('/:topic')
  .get(isLoggedInOptional,setHeaders,renderLibaryTopic)
  .all(verifyMethods(['GET']));

router.route('/:topic/:video')
  .get(isLoggedInOptional,setHeaders,renderVideoPage)
  .all(verifyMethods(['GET']))

export {router};
