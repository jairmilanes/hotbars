const { ControllerAbstract } = require("../../../server/controllers");
const { DataManager } = require("../../../server/data");

class MainController extends ControllerAbstract {

  async getTypeMenu() {
    const items = await DataManager.get().from("__types").all()
    return (items || []).map(item => ({
      path: `/_hotbars/type/${item.name.toLowerCase().trim().split(" ").join("-")}/`,
      title: item.name,
      icon: item.iconName
    }))
  }

  async handle(req, res, context) {
    const typeMenu = await this.getTypeMenu()

    return  {
      typeMenu
    }
  }
}

exports.controller = MainController;
