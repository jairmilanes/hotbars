import { TypeForm } from "./type-form.js"

export class TypeView {
  type = null
  constainer = $("#hb-data-type-view")
  preview = $("#hb-data-type-preview")
  typeForm

  constructor() {
    $.subscribe("hb-load-type", this.handleLoadType.bind(this))

    $.subscribe("hb-load-type-form", this.handleLoadTypeForm.bind(this))

    $.subscribe("hb-create-type", this.handleLoadTypeForm.bind(this))

    $.subscribe("hb-unload-type", this.handleUnloadType.bind(this))

    $.subscribe("hb-unload-preview", this.handleUnloadPreview.bind(this))
  }

  async handleLoadTypeForm(e) {
    this.type = e.type
    this.typeForm?.close()

    const context = {
      values: this.type || { fields: [] }
    }

    if (!this.type) {
      [
        { name: "id", label: "Id"},
        { name: "meta.status", label: "Status"},
        { name: "meta.visibility", label: "Visibility"},
        { name: "meta.createdAt", label: "Created At"},
        { name: "meta.updatedAt", label: "Updated At"},
      ]
        .forEach(metaColumn => {
          context.values.fields.push({
            "title": metaColumn.label,
            "name": metaColumn.name,
            "type": "hidden",
            "order": 0,
            "required": false,
            "placement": "main",
            "listHeader": false,
            "readOnly": true,
            "searchable": false,
            "constrains": []
          })
        })
    }

    this.typeForm = new TypeForm()

    context.types = e.types

    this.constainer.render("_data-type-form", this.typeForm.compute(context))

    this.typeForm.init()

    $.dispatch("hb-type-form-loaded", { form: this.typeForm })
  }

  handleLoadType(e) {
    if (!e.type) return

    this.type = e.type

    if (Array.isArray(this.type.fields)) {
      this.preview
        .render("_data-type-form-view", {
          title: this.type.title,
          closable: true,
          fields: this.type.fields,
          values: {}
        })
        .show()

      /* this.type.fields.forEach((field) => {
        if (field.type === "rich") {
          $(`#${field.id}`).richEditor()
        }
      }) */

      $.toggleable(null, this.preview)
      // $.dispatch(this.preview)
      // $.dismiss(null, this.preview)
    }
  }

  handleUnloadPreview() {
    this.preview.html("").hide()
  }

  handleUnloadType() {
    this.constainer.html("")
  }
}