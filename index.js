//Boilerplate
const express = require("express");
require("dotenv").config();
const app = express();
const path = require("path");
const PORT = process.env.PORT || 3000;
const expressLayouts = require("express-ejs-layouts");
const helmet = require('helmet');
const {addRoutes,initializePassport} = require('./utilities/init');
const closeApp = require('./utilities/closeApp');

//EJS and Templates
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.use(expressLayouts);
app.set("layout", "./layouts/layout.ejs");

//Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Web Content Policy and CORS
app.use(helmet({
    contentSecurityPolicy:{
      useDefaults:true,
      directives:{
        imgSrc:["'self'","https://res.cloudinary.com","https://i.ytimg.com"],
        scriptSrc:["'self'","'unsafe-inline'"],
        frameSrc:["'self'","https://www.youtube.com"],
      }
    },
}));

;(async () => {
  try {
    await initializePassport(app);
    await addRoutes(app);
  } catch(err) {
    console.error(`${new Date().toString()} -> App Init Failure: ${err.stack}`);
    process.exit(1);
  }
})();

//Port
const server = app.listen(PORT);

const exitHandler = closeApp(server, {
  coredump:false,
  timeout:500
});

process.on('uncaughtException', exitHandler(1, 'Unexpected Error'));
process.on('unhandledRejection', exitHandler(1, 'Unhandled Promise'));
process.on('SIGTERM', exitHandler(0, 'SIGTERM'));
process.on('SIGINT', exitHandler(0, 'SIGINT'));