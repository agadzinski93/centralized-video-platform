const helmet = require('helmet');
const closeApp = require('./closeApp');
const passport = require('passport');
const cookieParser = require("cookie-parser");
const rateLimit = require('express-rate-limit');

const Init = {
    addCloseProcessHandlers: (server) => {
        const exitHandler = closeApp(server, {
            coredump:false,
            timeout:500
          });
          
          process.on('uncaughtException', exitHandler(1, 'Unexpected Error'));
          process.on('unhandledRejection', exitHandler(1, 'Unhandled Promise'));
          process.on('SIGTERM', exitHandler(0, 'SIGTERM'));
          process.on('SIGINT', exitHandler(0, 'SIGINT'));
    },
    addRoutes:async(app)=>{
        let output = false;
        try {
            const {verifyUser} = await import('./validators/middleware/userAuth.mjs');
            app.use(verifyUser); //Middleware to populate req.user if logged in         

            const apiPath = (process.env.NODE_ENV === 'production') ? '/api/v1' : '/';

            let {apiRouter} = await import('../routes/apiRoute.mjs');
            app.use(apiPath, apiRouter);

            if (process.env.NODE_ENV !== 'production') {
                const {AppError} = await import('./AppError.mjs');
                app.all("*", (req, res, next) => {
                    return next(new AppError(404, "Page Not Found"));
                });
            }

            const {PATH_CSS,PATH_ASSETS,API_PATH} = await import('./config.mjs');

            //Error Handler
            app.use((err, req, res, next) => {
                if (res.headersSent) return;
                res.locals.message = err.message;
                const status = err.status || 500;
                const pageStyles = null;
                const message = (process.env.NODE_ENV === 'production') ? err.message : err.stack;
                res.status(status).render("error", { title: `${status} Error`, status, message, pageStyles, PATH_CSS, PATH_ASSETS, API_PATH, user: req.user });
            });
            output = true;
        } catch (err) {
            console.error(`${new Date().toString()} -> Import Routes Failed: ${err.stack}`);
        }
        return output;
    },
    addSecurityPolicy: (app) => {
        app.use(helmet({
            contentSecurityPolicy:{
              useDefaults:true,
              directives:{
                imgSrc:["'self'","data:","https://res.cloudinary.com","https://storage.googleapis.com",`https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com`,"https://i.ytimg.com"],
                scriptSrc:["'self'","'unsafe-inline'"],
                frameSrc:["'self'","https://www.youtube.com"],
              }
            },
        }));
    },
    addRateLimit: (app) => {
        const limiter = rateLimit({
            windowMs: 5 * 60 * 1000,
            limit: 100,
            standardHeaders: 'draft-7',
            legacyHeaders:false
        });
        app.use(limiter);
    },
    initializePassport: async(app) => {

        //Cookie Parser
        app.use(cookieParser(process.env.COOKIE_SECRET));

        //Passport
        app.use(passport.initialize());
        const {pp} = await import('./ppStrategies.mjs');
    }
}
module.exports = Init;