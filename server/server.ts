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
  initializePassport,
  addSwagger
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

app.get("/_health", (req, res) => {
  res.status(200).send('App is running.');
});

addSwagger(app);
addRoutes(app);

if (process.env.NODE_ENV === 'production') {
  const __dirname = path.resolve();
  app.use(express.static(path.join(__dirname, 'client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'dist', 'index.html'));
  });
}

//Port
const server = app.listen(PORT);
addCloseProcessHandlers(server);