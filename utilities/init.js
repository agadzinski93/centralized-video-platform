const helmet = require('helmet');
const closeApp = require('./closeApp');
const session = require("express-session");
const flash = require("connect-flash"); //Dependent on express-session
const cookieParser = require("cookie-parser");

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
            //Routes
            let {router : homeRoutes} = await import('../routes/homeRoutes.mjs');
            app.use("/", homeRoutes);

            let {router : userAuthRouter} = await import('../routes/userAuthRoutes.mjs');
            app.use("/auth",userAuthRouter);
            
            let {router : libraryRoutes} = await import('../routes/libraryRoutes.mjs');
            app.use("/lib",libraryRoutes);
            
            let {router : userRoutes} = await import('../routes/userRoutes.mjs');
            app.use("/user",userRoutes);
            
            let {router : topicRoutes} = await import('../routes/topicsRoutes.mjs');
            app.use("/topics",topicRoutes);
            
            let {router : videoRoutes} = await import('../routes/videoRoutes.mjs');
            app.use("/video",videoRoutes);

            let {router : subscriberRoutes} = await import('../routes/subscriberRoutes.mjs');
            app.use("/subscribe",subscriberRoutes);

            const {AppError} = await import('./AppError.mjs');
            app.all("*", (req, res, next) => {
                return next(new AppError(404, "Page Not Found"));
            });

            const {pathCSS,pathAssets} = await import('./config.mjs');

            //Error Handler
            app.use((err, req, res, next) => {
                res.locals.message = err.message;
                const status = err.status || 500;
                const pageStyles = null;
                const message = (process.env.NODE_ENV === 'production') ? err.message : err.stack;
                res.status(status).render("error", { title: `${status} Error`, status, message, pageStyles, pathCSS, pathAssets, user: req.user });
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
                imgSrc:["'self'","data:","https://res.cloudinary.com","https://i.ytimg.com"],
                scriptSrc:["'self'","'unsafe-inline'"],
                frameSrc:["'self'","https://www.youtube.com"],
              }
            },
        }));
    },
    initializePassport: async(app) => {
        //Flash
        app.use(flash());

        //Cookie Parser
        const COOKIE_SECRET = process.env.COOKIE_SECRET || "notsomuchasecret";
        app.use(cookieParser(COOKIE_SECRET));

        //Passport
        const {default:passport} = await import('../utilities/auth.mjs');
        const { sessionStore } = await import("./mysql-connect.mjs");
        const {flash : flashMessage} = await import("../utilities/flash.mjs");
        app.use(
        //Must occur prior to passport.initialize()
        session({
            secret: process.env.PASSPORT_SECRET,
            store: sessionStore,
            resave: false,
            saveUninitialized: false,
            cookie: {
            httpOnly: true,
            resave: false,
            saveUninitialized: false,
            secret: COOKIE_SECRET,
            store: sessionStore,
            maxAge: 24*60*60*1000,
            sameSite:"Lax"
            },
        })
        );
        app.use(passport.initialize());
        app.use(passport.session());
        app.use(flashMessage); //Flash messages
    }
}
module.exports = Init;