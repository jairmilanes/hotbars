const { ControllerAbstract } = require("../../server/controllers");
const { DataManager } = require("../../server/data");

class SignUpController extends ControllerAbstract {

  async handle(req) {
    // const db = DataManager.get()

    // db.from("__lighthouse")
    return {}
  }
}

exports.controller = SignUpController;