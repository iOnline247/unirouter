import path from "path";

import merge from "deepmerge";

import { getValueByKey, noop, sleep } from "./utils/common.js";
import ConfigManager from "./utils/configManager.js";
import logs from "./utils/logs.js";
import routes from "./routes/index.js";

const configFilePath = path.join(__dirname, "./config.json");
const config = new ConfigManager(configFilePath);

config.watch();

// This prevents the browser from sending a favicon request automatically
// and causing the responses to be out of order.
function nopeFavIcon(req, res, next) {
  if (req.originalUrl === "/favicon.ico") {
    res.send("");
  } else {
    next();
  }
}

// @ts-ignore
function setConfigOnSession(req, res, next) {
  const testConfig = config.get();
  const scenarioRuns = req.session?.unirouter?.scenarioRuns || {};
  const scenarioKey = `${testConfig.project}:${testConfig.scenario}`.toUpperCase();

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
    const tests = getValueByKey(project, routes);

    route = getValueByKey(scenario, tests);

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

// @ts-ignore
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
    req.uniSessionDestroyed = true;
    req.session.destroy(noop);
  }

  res.format({
    "text/plain": function textRes() {
      res.status(status).send(response);
    },
    "application/json": function jsonRes() {
      res.status(status).json(response);
    },
    "application/xml": function xmlRes() {
      res.set("Content-Type", "application/xml");
      res.status(status).send(response);
    },
  });

  next();
}

const unirouterMiddlewares = [
  nopeFavIcon,
  logs.reqInit,
  setConfigOnSession,
  findRoute,
  logs.reqRoute,
  delayRequest,
  sendResponse,
  logs.reqOutro,
];

export default unirouterMiddlewares;
