//Boilerplate
const express = require("express");
require("dotenv").config();
const app = express();
const path = require("path");
const PORT = process.env.PORT || 5000;
const expressLayouts = require("express-ejs-layouts");
const {
  addSecurityPolicy,
  addRateLimit,
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

initializePassport(app);
addSecurityPolicy(app);
addRateLimit(app);

let routesLoaded = false;

;(async () => {
  try {
    
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
        return res.status(200).send('<h1>App loaded. Please refresh!</h1>');
      }
      return next();
    },3000);
  }
  else {
    return next();
  }
});

app.get("/_health",(req,res)=>{
  res.status(200).send('App is running.');
});

if (process.env.NODE_ENV === 'production'){
  const __dirname = path.resolve();
  app.use(express.static(path.join(__dirname,'client/dist')));
  app.get('*',(req,res)=>{
      res.sendFile(path.resolve(__dirname,'client','index.html'));
  });
}

//Port
const server = app.listen(PORT);
addCloseProcessHandlers(server);