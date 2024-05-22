const { merge } = require("lodash")
const { ControllerAbstract } = require("../../../../../../server/controllers");
const { DataManager } = require("../../../../../../server/data");
const { logger } = require("../../../../../../services");

class TypeFormController extends ControllerAbstract {

  async getRecord(collection, id = undefined) {
    const data = DataManager.get()
    if (id) {
      return data.from(collection).get(id)
    }
    return data.from(collection).all()
  }

  async getType(typeId) {
    const data = DataManager.get()
    return data.from("__types").eq("name", typeId).single()
  }

  async getTypeEntry(typeId, id) {
    return this
      .get(`/_api/${typeId}/${id}`)
      .then(response => response?.data)
  }

  async getCategories() {
    return this.getRecord("__categories")
  }

  async getFile(id) {
    return this.getRecord("__files", id)
  }

  async getUser(id) {
    return this.getRecord("profile", id)
  }

  sort(by, direction, list) {
    if (direction === 'asc') {
      return list.sort((a, b) => (a[by] > b[by]) ? 1 : ((b[by] > a[by]) ? -1 : 0));
    } else if (direction === 'desc') {
      return list.sort((a, b) => (a[by] < b[by]) ? 1 : ((b[by] < a[by]) ? -1 : 0));
    }

    return list;
  }

  async extend(typeName, values) {
    const type = await this.getType(typeName)

    const extendedValues = merge({}, values)
    for (let i = 0; i < type.fields.length; i++) {
      const field = type.fields[i]

      if (field.type === "upload" && extendedValues[field.name]) {
        const image = await this.getFile(extendedValues[field.name])

        if (image) {
          extendedValues[field.name] = image
        }
      }

      if (field.type === "user" && extendedValues[field.name]) {
        const user = await this.getUser(extendedValues[field.name])

        if (user) {
          extendedValues[field.name] = await this.extend(
            "profile",
            user
          )
        }
      }

      if (field.type === "one-to-one" && extendedValues[field.name]) {
        const typeName = type["type-one-to-one-table"]
        const link = await this.getRecord(
          typeName,
          extendedValues[field.name]
        )

        if (link) {
          extendedValues[field.name] = await this.extend(typeName, link)
        }
      }

      if (field.type === "one-to-many" && extendedValues[field.name]) {
        const links = extendedValues[field.name]
        extendedValues[field.name] = []

        for (let i = 0; i < links.length; i++) {
          const typeName = type["type-one-to-one-table"]
          const link = await this.getRecord(typeName, links[i])

          if (link) {
            extendedValues[field.name].push(
              await this.extend(typeName, link)
            )
          }
        }
      }
    }

    return extendedValues
  }

  resolveViewParams(type, page) {
    return Object.keys(type).reduce((ac, prop) => {
      if (prop.startsWith(`details-${type.detailView}-`)) {
        const name = prop
          .replace(`details-${type.detailView}-`, "")
          .split("-")
          .shift()

        if (name) {
          ac[name] = page[type[prop]]
        }
      }
      return ac
    }, {})
  }

  async handle(req) {
    const typeId = req.params.type
    const entryId = req.params.id
    const type = await this.getType(typeId)

    if (!type) {
      throw new Error(`Type "${typeId}" could not be found!`)
    }

    const entry = await this.getTypeEntry(typeId, entryId)
    const page = await this.extend(type.name, entry)
    const categories = await this.getCategories()

    return  {
      title: type.title,
      collection: typeId,
      type,
      page: this.resolveViewParams(type, page),
      categories
    }
  }
}

exports.controller = TypeFormController;
