const { merge, upperFirst } = require("lodash");
const { ControllerAbstract } = require("../../../../../server/controllers");
const { DataManager } = require("../../../../../server/data");

class TypeFormController extends ControllerAbstract {

  async getType(typeId) {
    return this
      .get(`/_api/__types?name=${typeId}`)
      .then(response => {
        return response?.data.items ? response?.data.items[0] : null;
      });
  }

  async getTypeEntry(typeId, id) {
    return this
      .get(`/_api/${typeId}/${id}`)
      .then(response => response?.data);
  }

  async getCategories() {
    const data = DataManager.get();
    return data.from("__categories").all();
  }

  sort(by, direction, list) {
    if (direction === "asc") {
      return list.sort((a, b) => (a[by] > b[by]) ? 1 : ((b[by] > a[by]) ? -1 : 0));
    } else if (direction === "desc") {
      return list.sort((a, b) => (a[by] < b[by]) ? 1 : ((b[by] < a[by]) ? -1 : 0));
    }

    return list;
  }

  async attachFiles(type, values) {
    const extendedValues = merge({}, values);
    for (let i = 0; i < type.fields.length; i++) {
      const field = type.fields[i];

      if (field.type === "upload" && extendedValues[field.name]) {
        const image = await DataManager.get()
          .from("__files")
          .get(extendedValues[field.name]);

        if (image) {
          extendedValues[field.name] = image;
        }
      }

      if (field.type === "dropzone" && extendedValues[field.name]) {
        if (Array.isArray(extendedValues[field.name])) {
          extendedValues[field.name] = await Promise.all(
            extendedValues[field.name].map(id =>
              DataManager.get()
                .from("__files")
                .get(id)
            )
          );
        }
      }
    }
    return extendedValues;
  }

  async handle(req) {
    const typeId = req.params.type;
    const entryId = req.params.id;
    const type = await this.getType(typeId);

    if (!type) {
      throw new Error(`Type "${typeId}" could not be found!`);
    }

    const groups = type.fields.filter((field) => field.type === "group");

    type.fields = this.sort("order", "asc", type.fields);

    const headers = groups.reduce((ac, group) => {
      ac[group.id] = group.children
        .filter(child => child.listHeader)
        .map(child => child.name);
      return ac;
    }, {});

    const values = await this.getTypeEntry(typeId, entryId);
    const extendedValues = await this.attachFiles(type, values);
    const categories = await this.getCategories();
    const categoryOptions = categories.map((cat) => ({
      label: cat.name,
      parent: cat.parent || null,
      value: cat.id
    }));

    categoryOptions.unshift({
      label: "Top level",
      parent: null,
      value: null
    });

    const formId = "hb-type-form";

    const footerActions = [
      {
        component: "_button",
        type: "button",
        style: "outline",
        width: "auto",
        text: "Cancel",
        attr: {
          "data-dispatch": "hb-back-to-type-list"
        }
      },
      {
        component: "_button",
        type: "submit",
        formId,
        style: "solid",
        width: "auto",
        text: extendedValues?.id ? "Save" : "Create"
      }
    ];

    return {
      formId,
      title: `Id: ${extendedValues.id}`,
      titlePrefix: upperFirst(type.name),
      collection: typeId,
      type,
      fields: type.fields.map(field => {
        if (!field.placement) {
          field.placement = "main";
        }
        return field;
      }),
      headers,
      footerActions,
      values: extendedValues,
      categories: categoryOptions
    };
  }
}

exports.controller = TypeFormController;
