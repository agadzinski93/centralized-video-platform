import { Router } from "express";
import { router as HomeRouter } from "./homeRoutes";
import { router as UserAuthRouter } from "./userAuthRoutes";
import { router as LibraryRouter } from "./libraryRoutes"
import { router as UserRouter } from "./userRoutes";
import { router as SubscribeRouter } from "./subscriberRoutes"
import { router as TopicRouter } from "./topicsRoutes"
import { router as VideoRouter } from "./videoRoutes"

const apiRouter = Router();

apiRouter.use('/', HomeRouter);
apiRouter.use('/auth', UserAuthRouter);
apiRouter.use('/lib', LibraryRouter);
apiRouter.use('/user', UserRouter);
apiRouter.use('/subscribe', SubscribeRouter);
apiRouter.use('/topics', TopicRouter);
apiRouter.use('/video', VideoRouter);

export { apiRouter };