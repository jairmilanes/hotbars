const { ControllerAbstract } = require("../../../src");
const LawMainController  = require("../services/templates/law/main")
const DentalMainController  = require("../services/templates/dental/main")
const RealEstateMainController  = require("../services/templates/realestate/main")
const DeliveryMainController  = require("../services/templates/delivery/main")
const CorporateMainController  = require("../services/templates/corporate/main")

class MainController extends ControllerAbstract {

  async handle(req) {
    if (req.originalUrl.indexOf("/lawyer") > -1) {
      return await new LawMainController().handle(req);
    }

    if (req.originalUrl.indexOf("/dental") > -1) {
      return await new DentalMainController().handle(req);
    }

    if (req.originalUrl.indexOf("/realestate") > -1) {
      return await new RealEstateMainController().handle(req);
    }

    if (req.originalUrl.indexOf("/delivery") > -1) {
      return await new DeliveryMainController().handle(req);
    }

    if (req.originalUrl.indexOf("/corporate") > -1) {
      return await new CorporateMainController().handle(req);
    }

    return {}
  }
}

exports.controller = MainController;
