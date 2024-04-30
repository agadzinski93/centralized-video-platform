import { Express } from 'express';
import { Server } from 'http';
import { AppError } from './AppError';
import helmet from 'helmet';
import { terminate } from './closeApp';
import passport from 'passport';
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import { apiRouter } from '../routes/apiRoute';
import { verifyUser } from './validators/middleware/userAuth';
import { PATH_CSS, PATH_ASSETS, API_PATH } from './config';

import { Request, Response, NextFunction } from 'express';

const addCloseProcessHandlers = (server: Server) => {
    const exitHandler = terminate(server, {
        coredump: false,
        timeout: 500
    });

    process.on('uncaughtException', exitHandler(1, 'Unexpected Error'));
    process.on('unhandledRejection', exitHandler(1, 'Unhandled Promise'));
    process.on('SIGTERM', exitHandler(0, 'SIGTERM'));
    process.on('SIGINT', exitHandler(0, 'SIGINT'));
}
const addRoutes = (app: Express): void => {
    try {
        app.use(verifyUser); //Middleware to populate req.user if logged in         

        const apiPath = (process.env.NODE_ENV === 'production') ? '/api/v1' : '/';
        app.use(apiPath, apiRouter);

        if (process.env.NODE_ENV !== 'production') {
            app.all("*", (req: Request, res: Response, next: NextFunction) => {
                return next(new AppError(404, "Page Not Found"));
            });
        }

        //Error Handler
        app.use((err: AppError, req: Request, res: Response, next: NextFunction) => {
            if (res.headersSent) return;
            res.locals.message = err.message;
            const status = err.status || 500;
            const pageStyles = null;
            const message = (process.env.NODE_ENV === 'production') ? err.message : err.stack;
            res.status(status).render("error", { title: `${status} Error`, status, message, pageStyles, PATH_CSS, PATH_ASSETS, API_PATH, user: req.user });
        });
    } catch (err) {
        console.error(`${new Date().toString()} -> Import Routes Failed: ${(err as Error).stack}`);
    }
}
const addSecurityPolicy = (app: Express) => {
    app.use(helmet({
        contentSecurityPolicy: {
            useDefaults: true,
            directives: {
                imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://storage.googleapis.com", `https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com`, "https://i.ytimg.com"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                frameSrc: ["'self'", "https://www.youtube.com"],
            }
        },
    }));
}
const addRateLimit = (app: Express): void => {
    const limiter = rateLimit({
        windowMs: 5 * 60 * 1000,
        limit: 100,
        standardHeaders: 'draft-7',
        legacyHeaders: false
    });
    app.use(limiter);
}
const initializePassport = async (app: Express): Promise<void> => {

    //Cookie Parser
    app.use(cookieParser(process.env.COOKIE_SECRET));

    //Passport
    app.use(passport.initialize());
}

export {
    addCloseProcessHandlers,
    addRoutes,
    addSecurityPolicy,
    addRateLimit,
    initializePassport
};