//Boilerplate
import express from 'express';
import 'dotenv/config'
const app = express();
import path from 'path';
const PORT = process.env.PORT || 5000;
import expressLayouts from 'express-ejs-layouts'
import {
  addSecurityPolicy,
  addRateLimit,
  addCloseProcessHandlers,
  addRoutes,
  initializePassport
} from './utilities/init';

//Set proxy
app.set('trust proxy', (ip: string) => {
  if (ip === '127.0.0.1' || ip === '123.123.123.123') return true
  else return false
})

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

//let routesLoaded = false;
app.get("/_health", (req, res) => {
  res.status(200).send('App is running.');
});

addRoutes(app);

if (process.env.NODE_ENV === 'production') {
  const __dirname = path.resolve();
  app.use(express.static(path.join(__dirname, 'client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'dist', 'index.html'));
  });
}


/*
  App requires a functional path at runtime. It cannot wait for the async ES6 routes to load.
  This temporary message will be presented when the app first loads.
*/
/* app.use(function (req, res, next) {
  if (!routesLoaded) {
    setTimeout(() => {
      if (!routesLoaded) {
        return res.status(200).send('<h1>App loaded. Please refresh!</h1>');
      }
      return next();
    }, 3000);
  }
  else {
    return next();
  }
}); */

//Port
const server = app.listen(PORT);
addCloseProcessHandlers(server);