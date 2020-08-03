/* eslint-disable no-console */
import fs from "fs";
import { readFile } from "fs/promises";

import merge from "deepmerge";

import { debounce } from "./common.js";

const importedConfig = require("../config.json");

const config = merge({}, importedConfig);

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

    console.log(`Watching for file changes on: ${this.filePath}`);

    fs.watch(
      this.filePath,
      debounce(async (event, fileName) => {
        if (fileName && event === "change") {
          try {
            const jsonConfig = (await readFile(this.filePath)).toString("utf8");

            this.#config = JSON.parse(jsonConfig);

            console.log("Config has been updated.");
          } catch (err) {
            this.#config = {
              project: "",
              scenario: "",
              delaysInMs: [],
            };

            console.error(
              "The config couldn't parse properly. Default config loaded."
            );
          }
        }
      }, 100)
    );

    this.#isWatched = true;
  }

  get() {
    return merge({}, this.#config);
  }
}

export default ConfigManager;
