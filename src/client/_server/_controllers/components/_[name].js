const { ControllerAbstract } = require("../../../../server/controllers");

class ComponentController extends ControllerAbstract {

  async handle(req) {
    const { name } = req.params

    return  {
      partialName: name,
      ...req.query
    }
  }
}

exports.controller = ComponentController;
