import { promisify } from "util";
import { readFile } from "fs/promises";
import path from "path";

import morgan from "morgan";
import express from "express";
import session from "express-session";

import routes from "./routes/index.js";

const { PORT } = process.env;
const sleep = promisify(setTimeout);
const app = express();

app.use(session({ secret: "super secret", saveUninitialized: false }));
app.use(morgan("combined"));

app.all(
  "*/:route",
  async function getTestConfig(req, res, next) {
    let testConfig;

    try {
      const rawConfig = await readFile(
        path.join(process.cwd(), "./src/testConfig.json")
      );

      testConfig = JSON.parse(rawConfig.toString("utf8"));
    } catch (err) {
      console.error(err);
    }

    req.session.unirouter = {
      ...testConfig,
      ...req.session.unirouter,
    };

    const scenarioRunNumKey = `${testConfig.project}:${testConfig.scenario}`;
    req.session.unirouter[scenarioRunNumKey] =
      (req.session.unirouter[scenarioRunNumKey] || 0) + 1;

    console.log(req.session.unirouter);
    next();
  },

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
  function resetTestScenario(req, res, next) {
    // TODO:
    // Add this logic to the end of the middleware chain
    // if (req.session.PROJECT_NAME) {
    //   req.session.regenerate(noop);
    // }
    res.status(200).send({ test: true });
    next();
  },
  morgan("dev")
);

app.get("/", async (req, res) => {
  res.send("<h1>Welcome</h1>");
});

app.listen(PORT || 3000);
