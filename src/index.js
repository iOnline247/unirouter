import { promisify } from "util";
import { readFile } from "fs/promises";
import path from "path";

import merge from "deepmerge";
import morgan from "morgan";
import chalk from "chalk";
import express from "express";
import session from "express-session";

import { routes } from "./routes/index.js";

const { PORT } = process.env;
const noop = () => {};
const sleep = promisify(setTimeout);
const app = express();
const relConfigFilePath = "./src/testConfig.json";

app.use(
  session({ secret: "super secret", resave: false, saveUninitialized: false })
);
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
        path.join(process.cwd(), relConfigFilePath)
      );

      testConfig = JSON.parse(rawConfig.toString("utf8"));
    } catch (err) {
      // TODO:
      // Make this prettyish
      console.error(err);
      res.status(500).send(`The ${relConfigFilePath} is missing.`);
    }

    const scenarioRuns = req.session?.unirouter?.scenarioRuns || {};
    const scenarioKey = `${testConfig.project}:${testConfig.scenario}`;

    req.session.unirouter = merge(
      {
        ...testConfig,
        scenarioKey,
      },
      { scenarioRuns }
    );

    req.session.unirouter.scenarioRuns[scenarioKey] =
      (req.session.unirouter.scenarioRuns[scenarioKey] || 0) + 1;

    next();
  },
  function findRoute(req, res, next) {
    const { project, scenario, scenarioKey } = req.session.unirouter;
    let route;

    try {
      route = routes[project][scenario];

      // project may be defined, but not scenario.
      if (!route) {
        throw new Error(
          `Couldn't find the ${scenarioKey} in the 'routes' directory.`
        );
      }

      req.session.unirouter.route = route;

      console.log(`Route found: ${scenarioKey}`);
      next();
    } catch (err) {
      const errorMsg = `Couldn't find the ${scenarioKey} in the 'routes' directory.`;

      console.error(errorMsg);
      console.error(err);
      res.status(500).send(errorMsg);
    }
  },
  async function delayRequest(req, res, next) {
    const { delaysInMs, route } = req.session.unirouter;
    const runNumber =
      req.session.unirouter.scenarioRuns[req.session.unirouter.scenarioKey];
    const delay = delaysInMs[runNumber - 1];

    req.session.unirouter.isLastScenarioResponse =
      route.responses.length === runNumber;

    await sleep(delay);
    next();
  },
  function sendResponse(req, res, next) {
    const { route } = req.session.unirouter;
    const runNumber =
      req.session.unirouter.scenarioRuns[req.session.unirouter.scenarioKey];
    const { status, response } = route.responses[runNumber - 1];

    // TODO:
    // Support multiple Content-Types
    // http://expressjs.com/en/4x/api.html#res.format
    res.status(status).json(response);
    next();
  },
  function resetTestScenario(req, res, next) {
    if (req.session.unirouter.isLastScenarioResponse) {
      console.log("Destroying session...");
      req.session.destroy(noop);
    }
    next();
  },
  morgan("dev")
);

app.get("/", async (req, res) => {
  res.send("<h1>Welcome</h1>");
});

app.listen(PORT || 3000);
