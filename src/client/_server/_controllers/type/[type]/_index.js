const { ControllerAbstract } = require("../../../../../server/controllers");
const { DataManager } = require("../../../../../server/data");
const { logger } = require("../../../../../services");

class TypeIndexController extends ControllerAbstract {

  async getType(typeId) {
    return this
      .get(`/_api/__types?name=${typeId}`)
      .then(response => {
        return response?.data.items ? response?.data.items[0] : null
      })
  }

  async getTypeItems(typeId) {
    return this
        .get(`/_api/${typeId}`)
        .then(response => response?.data)
  }

  async getRecords(collection, page) {
    const data = DataManager.get()
    return data.from(collection)
      .offset((page - 1) * 10)
      .limit(10)

  }

  async handle(req, res) {
    const typeId = req.params.type
    const type = await this.getType(typeId)

    if (!type) {
      logger.warn(`Type "${typeId}" could not be found!`)
      return res.redirect("/_hotbars/404")
    }

    const response = await this.getTypeItems(typeId)

    let headers = type.fields
      ?.filter(field => field.listHeader)
      ?.map(field => field.name)

    if (!headers.length) {
      headers = ["id"]
    }

    const orderable = type.fields
      ?.filter(field => field.sortable)
      ?.map(field => ({
        label: field.title,
        value: field.name
      }))

    return  {
      title: type.title,
      type,
      viewId: `${type.listView}-view`,
      collection: typeId,
      paging: {
        current: response.page,
        from: response.from,
        to: response.to,
        total: response.total,
        pages: response.pages,
        next: response.next,
        prev: response.prev,
      },
      orderable,
      headers,
    }
  }
}

exports.controller = TypeIndexController;
