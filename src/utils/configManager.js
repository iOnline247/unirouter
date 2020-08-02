import fs from "fs";
import { readFile } from "fs/promises";

import chalk from "chalk";

class ConfigManager {
  #config;

  filePath;

  constructor(filePath) {
    return (async () => {
      const rawConfig = await readFile(filePath);

      this.filePath = filePath;
      this.#config = JSON.parse(rawConfig.toString("utf8"));

      return this;
    })();
  }

  watch() {
    console.log(chalk`Watching for file changes on: ${this.filePath}`);

    fs.watch(this.filePath, async (event, fileName) => {
      if (fileName && event === "change") {
        try {
          this.#config = JSON.parse(
            await readFile(this.filePath).toString("utf8")
          );
        } catch (err) {
          this.#config = {
            project: "",
            scenario: "",
            delaysInMs: [],
          };
        }
      }
    });
  }

  get() {
    return this.#config;
  }
}

// async function here(filePath) {
//   const rawConfig = await readFile(filePath);

//         testConfig = JSON.parse(rawConfig.toString("utf8"));
// }

// function getConfig(filePath) {
//   if (!testConfig) {
//     testConfig = here(filePath);
//   }

//   return testConfig;
// }

// function watchFile(filePath) {
//   console.log(chalk`Watching for file changes on: ${filePath}`);

//   fs.watch(filePath, async (event, fileName) => {
//     if (fileName && event === "change") {
//       try {
//         // testConfig =
//       } catch (err) {}
//     }
//   });
// }

export default ConfigManager;
