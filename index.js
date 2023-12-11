//Boilerplate
const express = require("express");
require("dotenv").config();
const app = express();
const path = require("path");
const PORT = process.env.PORT || 3000;
const expressLayouts = require("express-ejs-layouts");
const {
  addCloseProcessHandlers, 
  addRoutes, 
  addSecurityPolicy, 
  initializePassport} 
  = require('./utilities/init');

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
addCloseProcessHandlers(server);