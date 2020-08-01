import { promisify } from "util";
import { readFile } from "fs/promises";
import path from "path";

import morgan from "morgan";
import express from "express";
import session from "express-session";

import routes from "./routes/index";

const { PORT } = process.env;
const noop = () => {};
const sleep = promisify(setTimeout);
const app = express();

app.use(session({ secret: "super secret", saveUninitialized: false }));
app.use(morgan("combined"));

app.all(
  "*",
  // getTestConfig
  // IncrementTestRunNumber
  // Determine if request needs to be delayed based on the config.
  // Find corresponding Project/Test Scenario
  // If last scenario response, reset session
  function findRoute(req, res, next) {
    console.log(routes);
    next();
  },
  async function first(req, res, next) {
    await sleep(5000);
    next();
  },
  function second(req, res, next) {
    debugger;

    next();
  },
  morgan("dev")
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
