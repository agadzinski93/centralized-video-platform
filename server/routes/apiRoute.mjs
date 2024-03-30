import { Router } from "express";
import { router as HomeRouter } from "./homeRoutes.mjs";
import { router as UserAuthRouter } from "./userAuthRoutes.mjs";
import {router as LibraryRouter} from "./libraryRoutes.mjs"
import { router as UserRouter } from "./userRoutes.mjs";
import {router as SubscribeRouter} from "./subscriberRoutes.mjs"
import {router as TopicRouter} from "./topicsRoutes.mjs"
import {router as VideoRouter} from "./videoRoutes.mjs"

const apiRouter = Router();

apiRouter.use('/', HomeRouter);
apiRouter.use('/auth', UserAuthRouter);
apiRouter.use('/lib', LibraryRouter);
apiRouter.use('/user', UserRouter);
apiRouter.use('/subscribe',SubscribeRouter);
apiRouter.use('/topic', TopicRouter);
apiRouter.use('/video', VideoRouter);

export { apiRouter };