import { CreateGroupModal } from "../modal/create-group-form.js"
import { MoveFormModal } from "../modal/move-field-form.js"
import { AddHeaderForm } from "../modal/add-header-form.js"
import { AddFieldForm } from "../modal/add-field-form.js"
import { ViewConfig } from "./view-config.js"
import { orderable } from "../../base/orderable.js"
import { groupable } from "../base/groupable.js"
import { extender } from "../../utils.js"


export class TypeForm extends extender(groupable, orderable) {
  static id = "type-form"

  typeId;
  container
  form
  list
  listActions
  listMenu
  fieldForm;
  moveForm;
  orderOptions;
  context = {
    actions: false,
    menu: true,
    types: [],
    /* trackUser: false,
    trackCategories: false,
    trackStatus: false,
    itemsPerPage: 20,
    enableSearch: false,
    enablePagination: true,
    allowCreate: true,
    allowEdit: true,
    allowRemove: true,
    allowView: true, */
    values: {
      listView: "table",
      detailView: "form"
    },
    columnSizes: [
      { label: "50%", value: 6 },
      { label: "33%", value: 4 },
      { label: "25%", value: 3 }
    ],
    listViewLayouts: [
      { label: "Row", value: "row" },
      { label: "Column", value: "col" }
    ],
    listViewTypes: ViewConfig.listViewTypes,
    detailViewTypes: ViewConfig.detailViewTypes
  }
  view

  compute(context) {
    this.context = deepmerge(this.context, context)

    this.context
      .columns = this.context?.values?.fields.map(
        field => ({ label: field.title, value: field.name })
      ) || []

    this.context.columns.unshift({
      label: "Ignore",
      value: ""
    })

    this.context.columns.push(
      { label: "Status", value: "meta.status" }
    )

    this.context.columns.push(
      { label: "Visibility", value: "meta.visibility" }
    )

    this.context.columns.push(
      { label: "Created Date", value: "meta.createdAt" }
    )

    this.context.columns.push(
      { label: "Updated Date", value: "meta.updatedAt" }
    )

    this.context.values = this.mapToForm(this.context.values)

    return this.context
  }

  get id() {
    return $(`input[name="id"]`, this.form).val()
  }

  init() {
    this.container = $(`#hb-${TypeForm.id}`)
    this.form = $(`#${TypeForm.id}`).form({})
    this.listActions = $("#hb-list-actions-container")
    this.listMenu = $("#hb-list-menu-container")

    if (this.id) {
      this.form.attr("method", "PATCH")
    } else {
      this.form.attr("method", "POST")
    }

    this.list = $("#hb-fields-container").list(
      "_data_field",
      "_no-data-field-found"
    ).setDefaultSort("order", "asc")

    this.view = new ViewConfig(this.form, this.list)

    this.view.onFieldChanged(this.handleAdd.bind(this))

    $.subscribe("hb-new-field", this.handleOpenFieldForm.bind(this))
    $.subscribe("hb-edit-field", this.handleOpenFieldForm.bind(this))
    $.subscribe("hb-delete-fields", this.handleDeleteAll.bind(this))
    $.subscribe("hb-new-header", this.handleOpenHeaderModal.bind(this))
    $.subscribe("hb-edit-header", this.handleOpenHeaderModal.bind(this))
    $.subscribe("hb-preview-type", this.handlePreview.bind(this))

    this.form.on("hb-before-submit",this.handleBeforeSubmit.bind(this))
    this.form.on("hb-after-submit", this.handleAfterSubmit.bind(this))
    this.form.on("hb-form-changed", this.handleFormChanged.bind(this))

    this.form.on("hb-tab-changed", (e) => {
      if (!e.___td.id.startsWith("#hbs-fields-")) {
        this.listActions.hide()
        this.listMenu.show()
      } else {
        if (this.context.actions) {
          this.listActions.show()
        } else {
          this.listActions.hide()
        }
        if (this.context.menu) {
          this.listMenu.show()
        } else {
          this.listMenu.hide()
        }
      }
    })

    this.list.on("hb-selection-changed", (e) => {
      this.toggleActions(e.___td.count > 0)
    })

    this.list.on("hb-list-changed", (e) => {
      const { type, el } = e.___td
      if (type !== "removed") {
        // $.dispatch(el)
      }
    })

    if (this.context.values && this.context.values.fields) {
      this.list
        .setItems(this.context.values.fields)
        .sort("order", "asc")
        .update({ orderOptions: this.getOrderOptions(this.context.values.fields) })
    }

    // $.dismiss(null, this.container)
    $.swap(this.container)
    // $.dispatch(this.listActions)
    // $.dispatch(this.listMenu)
  }

  close() {
    this.form.resetForm()
    this.list.reset()
    $.unsubscribe("hb-new-field hb-edit-field hb-delete-fields hb-select-fields hb-new-header hb-edit-header hb-edit-group hb-new-group hb-preview-type")
    $.dispatch("hb-type-form-closed", {})
  }

  toggleActions(on) {
    if (on) {
      this.listActions.show()
      this.context.actions = true;
      this.listMenu.hide()
      this.context.menu = false;
    } else {
      this.listActions.hide()
      this.context.actions = false;
      this.listMenu.show()
      this.context.menu = true;
    }
  }

  handleDeleteAll() {
    this.list.getSelected()
      .forEach(item => {
        this.list.removeItem(item.id, item.groupName)
      })
    this.selected = {}
    this.fixOrder()
    this.toggleActions(false)
  }

  handleFormChanged(e) {
    if (e.___td.name === "order") {
      // return this.handleOrderChanged(e)
    }

    if (e.___td.name?.endsWith("-check")) {
      // return this.list.select(e.___td)
    }
  }

  handlePreview() {
    const type = this.mapToPayload(this.form.data())

    if (type) {
      $.dispatch("hb-load-type", { type: type })
    }
  }

  all() {
    return this.list.all();
  }

  mapToPayload(data) {
    data.title = $.utils.titleize(data.title || "")
    data.name = $.utils.camelCase(data.title || "")
    data.trackUser = data.trackUser === "true"
    data.trackCategories = data.trackCategories === "true"
    data.trackStatus = data.trackStatus === "true"
    data.trackFavorites = data.trackFavorites === "true"
    data.trackRatings = data.trackRatings === "true"
    data.allowCreate = data.allowCreate === "true"
    data.allowEdit = data.allowEdit === "true"
    data.allowRemove = data.allowRemove === "true"
    data.allowView = data.allowView === "true"
    data.enableSearch = data.enableSearch === "true"
    data.enableSelection = data.enableSelection === "true"
    data.enablePagination = data.enablePagination === "true"
    data.itemsPerPage = parseInt(data.itemsPerPage, 10)


    data["view-grid-column-size"] = parseInt(data["view-grid-column-size"], 10)
    data["details-form-readonly"] = data["details-form-readonly"] === "true"

    data.fields = this.list.all().map((field) => {
      if (!data.placement) {
        data.placement = "main"
      }

      const mapped = {
        ...field,
        columns: parseInt(field.columns, 10),
        order: parseInt(field.order, 10),
        required: field.required === "true",
        listHeader: field.listHeader === "true",
        readOnly: field.readOnly === "true",
        searchable: field.searchable === "true",
      }

      if (Array.isArray(field.children)) {
        mapped.children = field.children.map(child => ({
          ...child,
          columns: parseInt(child.columns, 10),
          order: parseInt(child.order, 10),
          required: child.required === "true",
          listHeader: child.listHeader === "true",
          readOnly: child.readOnly === "true",
          searchable: child.searchable === "true",
          sortable: child.sortable === "true",
        }))
      }

      return mapped
    })

    return data
  }

  mapToForm(data) {
    data.trackUser = data.trackUser ? "true" : "false"
    data.trackCategories = data.trackCategories ? "true" : "false"
    data.trackStatus = data.trackStatus ? "true" : "false"
    data.trackFavorites = data.trackFavorites ? "true" : "false"
    data.trackRatings = data.trackRatings ? "true" : "false"
    data.enableSearch = data.enableSearch ? "true" : "false"
    data.enableSelection = data.enableSelection ? "true" : "false"
    data.enablePagination = data.enablePagination ? "true" : "false"
    data.itemsPerPage = ""+data.itemsPerPage
    data.allowCreate = data.allowCreate ? "true" : "false"
    data.allowEdit = data.allowEdit ? "true" : "false"
    data.allowRemove = data.allowRemove ? "true" : "false"
    data.allowView = data.allowView ? "true" : "false"

    data["details-form-readonly"] = data["details-form-readonly"] ? "true" : "false"

    data.fields = data.fields.map((field) => {
      return {
        ...field,
        // columns: `${field.columns}`,
        // order: `${field.order}`,
        // required: field.required ? "true" : "false",
        // listHeader: field.listHeader ? "true" : "false",
        // readOnly: field.readOnly ? "true" : "false",
        // searchable: field.searchable ? "true" : "false",
      }
    })

    return data
  }

  handleBeforeSubmit(e) {
    const { data, method } = e.___td
    this.mapToPayload(data)
  }

  handleAfterSubmit(e) {
    const { data, method } = e.___td

    this.mapToForm(data)

    if (method === "post") {
      this.handleCreateCollection(data.name)
    }

    $.dispatch("hb-update-site-menu", { force: true })
    $.dispatch("hb-type-saved", { type: data })
  }

  async handleCreateCollection(name) {
    await $.rest.post("/_api/collections", { name })
  }

  handleAdd(field, groupId) {
    if (field.id) {
      this.list.replaceItem(field)
      // $.dispatch(list.getItemEl(field.id))
    } else {
      field.order = this.list.all().length

      this.list.appendItem(field, groupId)

      // $.dispatch(this.list.lastEl())
    }
  }

  handleOpenHeaderModal(e) {
    if (this.headerForm) {
      return;
    }

    const field = e.id ? this.list.getItem(e.id) : null

    this.headerForm = new AddHeaderForm({ values: field })

    this.headerForm.form.on("hb-closed", (e) => {
      this.headerForm = null
    })

    const group = e.group

    this.headerForm.form.on("hb-submit", (e) => {
      const { data } = e.___td
      this.handleAdd(data, data.groupName)
      this.headerForm = null
    })
  }

  handleOpenFieldForm(e) {
    if (this.fieldForm) {
      return;
    }

    const field = e.id ? this.list.getItem(e.id) : null

    const group = e.group

    this.fieldForm = new AddFieldForm({
      values: {
        ...(field || {}),
        groupName: group
      },
      types: this.context.types,
      type: this.context.types.find(type => type.id == this.id)
    });

    this.fieldForm.on("closed", (e) => {
      this.fieldForm = null
    })

    this.fieldForm.on("submit", (e) => {
      const { data } = e.___td
      this.handleAdd(data, group)
      this.fieldForm = null
    })
  }

  edit(type) {
    /* this.form.resetForm()
    this.list.reset()

    this.form.set("id", type.id)
    this.form.set("single", type.single)
    this.form.set("name", type.name)

    type.fields.forEach((field) => {
      this.list.appendItem(field)
    })

    $.dispatch(this.list) */
  }
}