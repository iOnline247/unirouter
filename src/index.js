import { promisify } from "util";
import { readFile } from "fs/promises";
import path from "path";

import morgan from "morgan";
import express from "express";
import session from "express-session";

const { PORT } = process.env;
const noop = () => {};
const sleep = promisify(setTimeout);
const app = express();

app.use(session({ secret: "super secret", saveUninitialized: false }));
app.use(morgan("dev"));

app.all(
  "*",
  async function first(req, res, next) {
    await sleep(5000);
    next();
  },
  function second(req, res, next) {
    debugger;

    next();
  }
);

app.get("/", async (req, res) => {
  let file;

  try {
    file = await readFile(path.join(__dirname, "../tsconfig.json"));

    console.log(JSON.parse(file.toString()));
  } catch (err) {
    console.error(err);

    debugger;
  }

  res.send("<h1>Welcome</h1>");
});

app.get("/*+/:scenario", async (req, res, next) => {
  await sleep(4000);

  //   console.log(req);

  res.json({ test: true });

  debugger;

  if (req.session.PROJECT_NAME) {
    req.session.regenerate(noop);
  }

  next();
});

app.listen(PORT || 3000);
