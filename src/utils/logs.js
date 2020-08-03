import chalk from "chalk";
import morgan from "morgan";

morgan.token("id", (req) => req.id);
morgan.token("delay", (req) => `${req.uniReqDelay}`);
morgan.token("scenarioKey", (req) => req.uniScenarioKey);
morgan.token(
  "sessionDestroyed",
  (req) => `${req.uniSessionDestroyed || false}`
);

const logPrefix = chalk`{blue [:date[iso]]} {yellow :id}`;
const scenarioKey = chalk.inverse(chalk`{white :scenarioKey}`);
const status = chalk.inverse(chalk`{white :status}`);
const logs = {
  reqInit: morgan(`${logPrefix} Request initiated...`),
  reqRoute: morgan(
    chalk`${logPrefix} Route found ${scenarioKey}, will delay for :delay ms`
  ),
  reqOutro: morgan(
    chalk`${logPrefix} :method :url ${status} Session destroyed - :sessionDestroyed`
  ),
};

export default logs;
