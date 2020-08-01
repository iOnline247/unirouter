import { promisify } from "util";
import { readFile } from "fs/promises";
import path from "path";

import merge from 'deepmerge';
import morgan from "morgan";
import chalk from "chalk";
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
    console.log(chalk`
{blue ${new Date().toISOString()}}
`);

    let testConfig;

    try {
      const rawConfig = await readFile(
        path.join(process.cwd(), "./src/testConfig.json")
      );

      testConfig = JSON.parse(rawConfig.toString("utf8"));
    } catch (err) {
      console.error(err);
    }
    
    const prevScenarioRuns = req.session?.unirouter?.scenarioRuns;

    req.session.unirouter = merge({ scenarioRuns: {} }, testConfig);
    
    if (prevScenarioRuns) {
      req.session.unirouter.scenarioRuns = prevScenarioRuns;
    }

    const scenarioRunNumKey = `${testConfig.project}:${testConfig.scenario}`;

    req.session.unirouter.scenarioRuns[scenarioRunNumKey] =
      (req.session.unirouter.scenarioRuns[scenarioRunNumKey] || 0) + 1;

    console.log(req.session.unirouter);
    next();
  },
  // Determine if request needs to be delayed based on the config.
  // Find corresponding Project/Test Scenario
  // If last scenario response, reset session
  function findRoute(req, res, next) {
    console.log(routes);

    // const route = routes[]
    next();
  },
  async function first(req, res, next) {
    await sleep(5000);
    next();
  },
  function resetTestScenario(req, res, next) {
    // TODO:
    // Add this logic to the end of the middleware chain
    // if (req.session.PROJECT_NAME) {
    //   req.session.regenerate(noop);
    // }

    // TODO:
    // Support multiple Content-Types
    // http://expressjs.com/en/4x/api.html#res.format
    res.status(200).send({ test: true });
    next();
  },
  morgan("dev")
);

app.get("/", async (req, res) => {
  res.send("<h1>Welcome</h1>");
});

app.listen(PORT || 3000);
