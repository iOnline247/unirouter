# unirouter

Orchestrate API responses to any endpoint. Point your requests to where this server is hosted and the request will respond to any endpoint requested. e.g. POST http://localhost:3000/resource/id, DELETE http://localhost:3000/entity/id/action.

## Usage

### Containerized

Open this project with VSCode. Since this project has a `.devcontainer` folder, you'll be prompted to reopen in the container. Once the container is running, at the shell prompt run this command: `npm install`. After the dependencies are installed, press `F5` and the unirouter will be running on port 3000.

### VSCode Only

Open the project within VSCode, run this command: `npm install` in the shell. After the dependencies are installed, press `F5` and the unirouter will be running on port 3000.

### Changing the `config.json`

The [./src](./src) directory contains the [config.json](./src/config.json) file. This file is used to determine which scenario responses unirouter will use. The config is watched for changes, so the server doesn't have to be restarted when a new scenario needs to be tested.

To change to a new scenario, type the project name and the scenario. Both are case-insensitive.

### Creating a new scenario

All of the scenarios are kept under the [./src/routes](./src/routes) directory. Within this directory, create a new JavaScript file. Create a variable and name it what the project is. Within this object, each key will represent a `scenario`. Each scenario will require a key named `responses`, which is an array of responses.

For each response, the `status` and `response` keys are required.

```javascript
const sentinel = {
  bossSauce: {
    responses: [
      {
        status: 503,
        response: { deathRay: "fire" }
      },
      {
        status: 200,
        response: { count: 116, sentries: [1, 2, 3] }
      },
      {
        status: 200,
        response: { count: 2222, sentries: [2222, 222, 222, 22, 2] }
      }
    ]
  },
  engage: {
    responses: [
      {
        status: 400,
        response: { count: 999, sentries: [999, 99, 9] }
      },
      {
        status: 503,
        response: { photons: "locked", phasers: "stun" }
      },
      {
        status: 200,
        response: { count: 2222, sentries: [2222, 222, 222, 22, 2] }
      },
      {
        status: 200,
        response: { count: 3333, klingons: [3333, 333, 33, 3] }
      }
    ]
  }
};

export default sentinel;
```

Once this file is created, open the [`./src/routes/index.js`](./src/routes/index.js) file and `import` the new project and add to the `routes` variable as a new key/value.

```javascript
const routes = {
  // Add new projects here.
  myProject,
  sentinel
};
```

Once a new project or a new scenario is added, the server does need to be restarted for these to be used.
