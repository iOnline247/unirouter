import path from "path";

import { getValueByKey, sleep } from "./utils/common.js";
import ConfigManager from "./utils/configManager.js";
import logs from "./utils/logs.js";
import routes from "./fixtures/index.js";

const configFilePath = path.join(__dirname, "./config.json");
const config = new ConfigManager(configFilePath);
const sessionState = {};

config.watch();

// @ts-ignore
function setConfigOnSession(req, res, next) {
  req.unirouter = config.get();

  const scenarioKey = `${req.unirouter.project}:${req.unirouter.scenario}`.toUpperCase();
  const runNumber = (sessionState[scenarioKey] || 0) + 1;

  req.unirouter.scenarioKey = scenarioKey;
  req.unirouter.runNumber = runNumber;
  sessionState[scenarioKey] = runNumber;

  next();
}

function findRoute(req, res, next) {
  const {
    delaysInMs,
    project,
    runNumber,
    scenario,
    scenarioKey,
  } = req.unirouter;

  try {
    const tests = getValueByKey(project, routes);
    const route = getValueByKey(scenario, tests);

    // project may be defined, but not scenario.
    if (!route) {
      throw new Error(
        `Couldn't find the ${scenarioKey} in the 'fixtures' directory.`
      );
    }

    const scenarioIdx = runNumber - 1;
    const delay =
      route.responses?.[scenarioIdx]?.delay ?? delaysInMs[scenarioIdx];

    req.unirouter.route = route;
    req.unirouter.delay = delay;
    req.uniReqDelay = delay;
    req.uniScenarioKey = scenarioKey;

    next();
  } catch (err) {
    // TODO:
    // Figure out the bug with asyncie.js tests.
    console.error(`runNumber: ${runNumber}`);
    res.status(500).send(`[unirouter]: ${err.message}, ${err.stack}`);
  }
}

// @ts-ignore
async function delayRequest(req, res, next) {
  const { delay } = req.unirouter;

  await sleep(delay);
  next();
}

function sendResponse(req, res, next) {
  const { route, runNumber } = req.unirouter;

  let contentType;
  let status;
  let response;

  try {
    ({ contentType, status, response } = route.responses[runNumber - 1]);
  } catch (err) {
    // TODO:
    // Add the same logging that will be used for the above `try/catch`
    // in `findRoute`.
    /* eslint-disable no-console */
    console.error(`runNumber: ${runNumber}`);
    console.error(JSON.stringify(req.unirouter));
    /* eslint-enable no-console */

    res
      .status(500)
      .send("[unirouter]: Error with sessionState. This should never occur.");

    return;
  }

  const isLastScenarioResponse = route.responses.length === runNumber;

  if (isLastScenarioResponse) {
    req.uniSessionDestroyed = true;
    sessionState[req.unirouter.scenarioKey] = 0;
  }

  if (contentType) {
    res.set("Content-Type", contentType);
    res.status(status).send(response);
  } else {
    res.format({
      "text/plain": function textRes() {
        res.status(status).send(response);
      },
      "text/html": function htmlRes() {
        res.set("Content-Type", "text/html");
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
  }

  next();
}

const unirouterMiddlewares = [
  logs.reqInit,
  setConfigOnSession,
  findRoute,
  logs.reqRoute,
  delayRequest,
  sendResponse,
  logs.reqOutro,
];

export default unirouterMiddlewares;
