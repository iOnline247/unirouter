import fs from "fs";
import { readFile } from "fs/promises";

import chalk from "chalk";
import merge from "deepmerge";

import Logger from "./logger.js";

const importedConfig = require("../config.json");

const config = merge({}, importedConfig);
// const logger = new Logger();

// Interesting topics.
// https://stackoverflow.com/a/50477084
// https://stackoverflow.com/a/31268370
class ConfigManager {
  #config;

  #isWatched;

  filePath;

  constructor(filePath) {
    this.filePath = filePath;
    this.#config = config;
  }

  watch() {
    if (this.#isWatched) {
      return;
    }

    console.log(chalk`Watching for file changes on: ${this.filePath}`);

    fs.watch(this.filePath, async (event, fileName) => {
      if (fileName && event === "change") {
        try {
          const jsonConfig = (await readFile(this.filePath)).toString("utf8");

          this.#config = JSON.parse(jsonConfig);
        } catch (err) {
          this.#config = {
            project: "",
            scenario: "",
            delaysInMs: [],
          };
        }
      }
    });

    this.#isWatched = true;
  }

  get() {
    return this.#config;
  }
}

export default ConfigManager;
