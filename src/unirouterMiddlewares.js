import path from "path";

import chalk from "chalk";
import merge from "deepmerge";
import morgan from "morgan";

import { noop, sleep } from "./utils/common.js";
// import Logger from "./utils/logger.js";
import ConfigManager from "./utils/configManager.js";
import { routes } from "./routes/index.js";

const configFilePath = path.join(__dirname, "./config.json");
const config = new ConfigManager(configFilePath);

config.watch();

morgan.token("id", (req) => req.id);
morgan.token("delay", (req) => `${req.uniReqDelay}`);
morgan.token("scenarioKey", (req) => req.uniScenarioKey);
morgan.token(
  "sessionDestroyed",
  (req) => `${req.uniSessionDestroyed || false}`
);

// function setLoggerOnRequest(req, res, next) {
//   req.logger = new Logger(req.id);

//   next();
// }

function setConfigOnSession(req, res, next) {
  //     console.log(chalk`
  // {blue ${new Date().toISOString()}}
  // `);
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
}

function findRoute(req, res, next) {
  const { delaysInMs, project, scenario, scenarioKey } = req.session.unirouter;
  // TODO:
  // Put delay on the req object.
  const runNumber = req.session.unirouter.scenarioRuns[scenarioKey];
  const delay = delaysInMs[runNumber - 1];

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
    req.uniReqDelay = delay;
    req.uniScenarioKey = scenarioKey;

    next();
  } catch (err) {
    const errorMsg = `Couldn't find the ${scenarioKey} in the 'routes' directory.`;

    res.status(500).send(errorMsg);
  }
}

async function delayRequest(req, res, next) {
  const { delaysInMs, route } = req.session.unirouter;
  // TODO:
  // Put delay on the req object.
  const runNumber =
    req.session.unirouter.scenarioRuns[req.session.unirouter.scenarioKey];
  const delay = delaysInMs[runNumber - 1];

  req.session.unirouter.isLastScenarioResponse =
    route.responses.length === runNumber;

  await sleep(delay);
  next();
}

function sendResponse(req, res, next) {
  const { route } = req.session.unirouter;
  const runNumber =
    req.session.unirouter.scenarioRuns[req.session.unirouter.scenarioKey];
  const { status, response } = route.responses[runNumber - 1];

  if (req.session.unirouter.isLastScenarioResponse) {
    // console.log("Destroying session...");
    req.uniSessionDestroyed = true;
    req.session.destroy(noop);
  }
  // TODO:
  // Support multiple Content-Types
  // http://expressjs.com/en/4x/api.html#res.format
  res.status(status).json(response);
  next();
}

const unirouterMiddlewares = [
  morgan("[:date[iso]] :id Request initiated..."),
  // setLoggerOnRequest,
  setConfigOnSession,
  findRoute,
  morgan("[:date[iso]] :id Route found :scenarioKey, will delay for :delay ms"),
  delayRequest,
  sendResponse,
  morgan(
    chalk`{blue [:date[iso]]} {yellow :id} :method :url :status Session destroyed - :sessionDestroyed`
  ),
];

export default unirouterMiddlewares;
