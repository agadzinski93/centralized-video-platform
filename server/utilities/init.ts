import { Express } from 'express';
import { Server } from 'http';
import { AppError } from './AppError';
import helmet from 'helmet';
import { terminate } from './closeApp';
import { getDatabaseCreds } from './db/mysql-connect';
import session from 'express-session'
const MySQLStore = require('express-mysql-session')(session);
import passport from 'passport';
import './ppStrategies';
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import { apiRouter } from '../routes/apiRoute';
import { verifyUser } from './validators/middleware/userAuth';
import { setCors } from './validators/middleware/setHeaders';
import { PATH_CSS, PATH_ASSETS, API_PATH, NODE_ENV, SESSION_SECRET, COOKIE_SECRET } from './config/config';

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
            if (err.message === 'Authentication Failed. Logging out.') req.logout((err) => { });
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
    app.use(setCors());

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
        windowMs: 5 * 1000,
        limit: 100,
        standardHeaders: 'draft-7',
        legacyHeaders: false
    });
    app.use(limiter);
}
const initializePassport = (app: Express): void => {
    if (!SESSION_SECRET) throw new Error('No secret provided for session. Check ENV variables.');

    //Cookie Parser
    app.use(cookieParser(COOKIE_SECRET));

    //Add MySQL Store
    const options = getDatabaseCreds();
    const sessionStore = new MySQLStore(options);

    //Add Session
    app.use(session({
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: sessionStore,
        cookie: {
            httpOnly: true,
            maxAge: 1000 * 60 * 60,
            sameSite: 'strict',
            secure: (NODE_ENV === 'production') ? true : false,
        }
    }));

    //Passport
    app.use(passport.initialize());
    app.use(passport.session());
}

export {
    addCloseProcessHandlers,
    addRoutes,
    addSecurityPolicy,
    addRateLimit,
    initializePassport
};