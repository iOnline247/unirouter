/* eslint-disable no-console */
import chalk from "chalk";
import { v4 as uuidv4 } from "uuid";

const LOG_TYPES = {
  DEBUG: "DEBUG",
  ERROR: "ERROR",
  INFO: "INFO",
  LOG: "INFO",
  TRACE: "TRACE",
  WARN: "WARN",
};

function formatMsg(...[id, logLevel, msg]) {
  return chalk`[${new Date().toISOString()}] [${logLevel}] ${id} ${msg}`;
}

class Logger {
  #req;

  #correlationId;

  get request() {
    return this.#req;
  }

  set request(req) {
    this.#req = req;
  }

  debug(msg) {
    const logLevel = LOG_TYPES.DEBUG;

    console.debug(formatMsg(this.#correlationId, logLevel, msg));
  }

  error(msg) {
    const logLevel = LOG_TYPES.ERROR;

    console.error(formatMsg(this.#correlationId, logLevel, msg));
  }

  info(msg) {
    const logLevel = LOG_TYPES.INFO;

    console.info(formatMsg(this.#correlationId, logLevel, msg));
  }

  log(msg) {
    const logLevel = LOG_TYPES.LOG;

    console.log(formatMsg(this.#correlationId, logLevel, msg));
  }

  warn(msg) {
    const logLevel = LOG_TYPES.WARN;

    console.warn(formatMsg(this.#correlationId, logLevel, msg));
  }
}

export default { Logger };
