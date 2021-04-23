const express = require("express");
require("dotenv").config();
const app = express();
const path = require("path");
const engine = require("ejs-mate");
app.engine("ejs", engine);
const session = require("express-session");
const flash = require("express-flash");

//Passport
const pp = require("./utilities/auth");
app.use(
  session({
    secret: process.env.PASSPORT_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(pp.initialize());
app.use(pp.session());
app.use(flash());

//Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//EJS and Templates
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

//Routes
app.get("/", (req, res) => {
  res.render("Index", { req });
});
app.use("/", require("./routes/userAuthRoutes"));
app.use("/lib", require("./routes/libraryRoutes"));

app.all("*", (req, res, next) => {
  res.send("404 Not Found");
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
