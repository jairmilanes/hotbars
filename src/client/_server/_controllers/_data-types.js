const { ControllerAbstract } = require("../../../server/controllers");
const { DataManager } = require("../../../server/data");

class DataTypesController extends ControllerAbstract {

  getTypes() {
    return DataManager.get().from("__types").all()
  }

  async handle(req) {
    const fieldTypes = [
      {value: "text", label: "Text"},
      {value: "textarea", label: "Textarea"},
      {value: "number", label: "Number"},
      {value: "select", label: "Select"},
      {value: "checkbox", label: "Checkbox"},
      {value: "rich", label: "Rich Text"},
    ]

    const validations = [
      {value: "min", label: "min"},
      {value: "max", label: "max"},
      {value: "in", label: "in"},
      {value: "not-in", label: "not-in"},
    ]

    const types = await this.getTypes()

    return  {
      fieldTypes,
      validations,
      types
    }
  }
}

exports.controller = DataTypesController;
