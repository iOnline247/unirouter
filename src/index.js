import express from "express";
import addRequestId from "express-request-id";
import cors from "cors";

import unirouterMiddlewares from "./unirouterMiddlewares";

const { PORT = 3000 } = process.env;
const app = express();

app.use(addRequestId());

// @ts-ignore
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

app.use(
  cors({
    // @ts-ignore
    origin(origin, callback) {
      return callback(null, true);
    }
  })
);

// @ts-ignore
app.get("/favicon.ico", async (req, res) => {
  res.status(200).send("");
});

// @ts-ignore
app.get("/", async (req, res) => {
  res.send(
    `<h1>Hola, mundo desde unirouter. <span style="color: #FF4136;">&#9829;</span></h1>`
  );
});

app.all("*/:route", ...unirouterMiddlewares);
app.listen(PORT, function serverInit() {
  // eslint-disable-next-line no-console
  console.log(`unirouter is listening on: http://localhost:${PORT}`);
});
