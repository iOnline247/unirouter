import express from "express";
import addRequestId from "express-request-id";
import session from "express-session";
import csp from "helmet-csp";
import cors from "cors";

import unirouterMiddlewares from "./unirouterMiddlewares";

const { PORT = 3000 } = process.env;
const app = express();

app.use(addRequestId);
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});
app.use(
  session({
    secret: "super secret",
    resave: false,
    saveUninitialized: false,
    cookie: { sameSite: "strict" },
  })
);
app.use(
  cors({
    origin(origin, callback) {
      return callback(null, true);
    },
  })
);
app.use(
  csp({
    directives: {
      scriptSrc: ["'unsafe-inline'", "'unsafe-eval'"],
    },
  })
);

app.all("*/:route", ...unirouterMiddlewares);

app.get("/", async (req, res) => {
  res.send(
    `<h1>Hola, mundo desde unirouter. <span style="color: #FF4136;">&#9829;</span></h1>`
  );
});

// TODO:
// Is this needed?
app.get("/favicon.ico", (req, res) => {
  res.status(200).end();
});

app.listen(PORT);
