const { ControllerAbstract } = require("../../../../server/controllers");

class ComponentsController extends ControllerAbstract {

  async handle(req) {
    const selectOptions = [
      {value: "option-1", label: "Option One"},
      {value: "option-2", label: "Option Two"},
      {value: "option-3", label: "Option Three"}
    ]

    return  {
      selectOptions,
      values: {
        "select-test": "option-2"
      }
    }
  }
}

exports.controller = ComponentsController;
