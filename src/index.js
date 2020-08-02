import { promisify } from "util";
import path from "path";

import merge from "deepmerge";
import morgan from "morgan";
import chalk from "chalk";
import express from "express";
import session from "express-session";
import csp from "helmet-csp";
import cors from "cors";

import ConfigManager from "./utils/configManager.js";
import { routes } from "./routes/index.js";

const { PORT = 3000 } = process.env;
const noop = () => {};
const sleep = promisify(setTimeout);
const app = express();
const configFilePath = path.join(process.cwd(), "./src/config.json");
const config = new ConfigManager(configFilePath);

// TODO:
// Remove this hack.
// https://stackoverflow.com/a/50477084
// https://stackoverflow.com/a/31268370
setTimeout(() => {
  config.watch();
}, 1000);

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

app.all(
  "*/:route",
  async function getTestConfig(req, res, next) {
    console.log(chalk`
{blue ${new Date().toISOString()}}
`);
    const testConfig = config.get();
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
  res.send(
    `<h1>Hola, mundo desde unirouter. <span style="color: #FF4136;">&#9829;</span></h1>`
  );
});

app.listen(PORT);
