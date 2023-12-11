//Boilerplate
const express = require("express");
require("dotenv").config();
const app = express();
const path = require("path");
const PORT = process.env.PORT || 3000;
const expressLayouts = require("express-ejs-layouts");
const {
  addSecurityPolicy,
  addCloseProcessHandlers, 
  addRoutes,
  initializePassport
} = require('./utilities/init');

//EJS and Templates
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.use(expressLayouts);
app.set("layout", "./layouts/layout.ejs");

//Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

addSecurityPolicy(app);

let routesLoaded = false;

;(async () => {
  try {
    await initializePassport(app);
    routesLoaded = await addRoutes(app);

  } catch(err) {
    console.error(`${new Date().toString()} -> App Init Failure: ${err.stack}`);
    process.exit(1);
  }
})();

/*
  App requires a functional path at runtime. It cannot wait for the async ES6 routes to load.
  This temporary message will be presented when the app first loads.
*/
app.use(function(req,res,next){
  if (!routesLoaded) {
    setTimeout(()=>{
      if (!routesLoaded) {
        res.status(200).send('<h1>App loaded. Please refresh!</h1>');
      }
      return next();
    },1000);
  }
  else {
    return next();
  }
});

//Port
const server = app.listen(PORT);
addCloseProcessHandlers(server);