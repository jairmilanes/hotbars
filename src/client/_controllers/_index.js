const { ControllerAbstract } = require("../../server/controllers");
const { Versioning, EnvManager } = require("../../server/core");
const { readJson } = require("../../")
const { logger } = require("../../services");

class DeploymentController extends ControllerAbstract {

  async handle(req) {
    // const db = DataManager.get()
    // db.from("__lighthouse")
    const status = await Versioning.status();
    const version = Versioning.get()
    const ppackage = await readJson("../package.json")
    const apis = EnvManager.get()
    const isLocal = req.original?.env.name === "local"

    return {
      isLocal,
      currentEnv: req.original.env,
      version: ppackage.version,
      branch: version.branch,
      outOfSync: isLocal && status.modified?.length > 0,
      status,
      envs: {
        loaded: apis.loaded,
        apps: apis.envs
      },
      messages: [
        ...version.messages,
        ...apis.messages
      ]
    }
  }
}

exports.controller = DeploymentController;
