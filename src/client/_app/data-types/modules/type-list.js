import { BaseList } from "../../base/list.js";
import { DeleteTypeConfirmModal } from "../modal/delete-type-modal.js"
import { TypeForm } from "./type-form.js"

export class TypesList extends BaseList {

  active = null;

  params;

  constructor() {
    super("hb-types", "_data_type", "__types");

    $.subscribe("hb-before-submit",this.handleBeforeSubmit.bind(this))
    $.subscribe("hb-delete-type-confirm", this.handleDeleteType.bind(this))
    $.subscribe("hb-type-saved", this.handleTypeSaved.bind(this))

    this.params = $.query()

    $.subscribe("hb-edit-field-form", this.handleEditType.bind(this))

    $.subscribe("hb-type-form-loaded", (e) => {
      this.form = e.form
    })
  }

  mapValues(data) {
    data.items = data.items.map(type => ({
      ...type,
      fields: type.fields.map(field => {
        const f = {
          ...field,
          // order: `${field.order}`,
          required: field.required ? "true" : "false",
          listHeader: field.listHeader ? "true" : "false",
          readOnly: field.readOnly ? "true" : "false",
          searchable: field.searchable ? "true" : "false",
        }

        if (field.type === "group") {
          f.children = (f.children || []).map(child => ({
            ...child,
            required: child.required ? "true" : "false",
            listHeader: child.listHeader ? "true" : "false",
            readOnly: child.readOnly ? "true" : "false",
            searchable: child.searchable ? "true" : "false",
          }))
        }

        return f
      })
    }))

    return data
  }

  load(params) {
    this.loading(true)

    return super.load(params, this.mapValues.bind(this))
      .then((items) => {
        $.dropdown(this.list)
        $.swap(this.list)
        $.forms(this.list)
        // $.dispatch(this.list)

        this.loading(false)

        if ($.query("type")) {
          const item = this.list.all().find(item => item.name === $.query("type"))

          if (item) {
            this.list.setActive(item.id, true)
            this.handleEditType(item)
          }
        }
      })
      .catch(e => {
        console.error(e)
        this.loading(false)
      })
  }

  handleBeforeSubmit(e) {
    const { id, form, data } = e

    if (id.startsWith("delete-type-")) {
      // Adds visuals to list item being removed and closes the dropdown
      const container = form.closest('h4[data-list-item]')
      if (container) container.addClass("animate-pulse text-gray-700 dark:text-white bg-red-500 dark:bg-red-600")
      container.get(0).focus()
    }

    if (id === TypeForm.id) {
      // console.log(data)
    }
  }

  async handleDeleteType(e) {
    const item = this.list.getItem(e.id)

    const modal = new DeleteTypeConfirmModal({
      type: item,
      message: `Delete type "${item.title}"?`,
      description: "All fields and data associated with this type will be permanently deleted."
    })

    $.subscribe("hb-delete-type", async (e) => {
      const { type } = e
      await $.rest.delete(`/_api/__types/${type.id}`)

      await this.load($.query())
      this.handleUpdateMenu()
      const next = this.list.first()

      if (next) {
        this.handleEditType(next)
      }

      $.unsubscribe("hb-delete-type")
      $.unsubscribe("hb-delete-type-modal-closed")
    })

    $.subscribe("hb-delete-type-modal-closed", async (e) => {
      $.unsubscribe("hb-delete-type")
      $.unsubscribe("hb-delete-type-modal-closed")
    })
  }

  async handleTypeSaved(e) {
    const { id, form, type } = e
    await this.load($.query())
    this.handleUpdateMenu()
    this.handleEditType(type)
  }

  handleUpdateMenu() {
    $.dispatch("hb-update-site-menu", {
      items: this.list.all().map(item => {
        return {
          path: `/type/${item.name.toLowerCase().trim().split(" ").join("-")}/`,
          title: item.name,
          icon: item.iconName
        }
      })
    })
  }

  handleEditType(data) {
    let type;

    if (data.id) {
      type = this.list.getItem(data.id)
    }

    if (type) {
      this.list.setActive(type.id, true)
    }

    $.dispatch("hb-load-type-form", { type, types: this.list.all() })
  }
}