//Boilerplate
const express = require("express");
require("dotenv").config();
const app = express();
const path = require("path");
const AppError = require("./utilities/AppError");

//EJS and Templates
const expressLayouts = require("express-ejs-layouts");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(expressLayouts);
app.set("layout", "./layouts/layout.ejs");

//Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Flash
const session = require("express-session");
const flash = require("connect-flash"); //Dependent on express-session
app.use(flash());

//Cookie Parser
const cookieParser = require("cookie-parser");
const COOKIE_SECRET = process.env.COOKIE_SECRET || "notsomuchasecret";
app.use(cookieParser(COOKIE_SECRET));

//Passport
const pp = require("./utilities/auth");
const { sessionStore } = require("./utilities/mysql-connect");
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
    },
  })
);
app.use(pp.initialize());
app.use(pp.session());
app.use(require("./utilities/flash")); //Flash messages

//Routes
app.use("/", require("./routes/homeRoutes"));
app.use("/auth", require("./routes/userAuthRoutes"));
app.use("/lib", require("./routes/libraryRoutes"));
app.use("/user", require("./routes/userRoutes"));
app.use("/topics", require("./routes/topicsRoutes"));
app.use("/video", require("./routes/videoRoutes"));

app.all("*", (req, res, next) => {
  return next(new AppError(404, "Page Not Found"));
});

//Error Handler
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  const status = err.status || 500;
  const pageStyles = null;
  res.status(status).render("error", { title: `${status} Error`, status, pageStyles, user: req.user });
});

//Port
app.listen(3000, () => {
  console.log("Listening on port 3000");
});
