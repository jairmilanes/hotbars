import { buildConstrains } from "../services/constrains.js"
import { ListGroupModal } from "../modules/list-group-modal.js"
import { Sidebar } from "./sidebar/index.js"

const errorMessages = {
  required: "Must provide a %s",
  min: "Too short, must be at least %{count} characters",
  max: "Too long, must have a maximum of %{count} characters",
}

class Type {
  static id= "hb-type-form"
  form
  entryId
  collection
  modules
  type
  lists = {}
  groupForm

  constructor() {
    this.collection = $(`#${Type.id}`).data("collection")

    $.subscribe("hb-add-to-group-list", this.handleOpenGroupForm.bind(this))
    $.subscribe("hb-delete-all", this.handleDeleteAll.bind(this))
    $.subscribe("hb-edit-row", this.handleOpenGroupForm.bind(this))

    $.subscribe("hb-back-to-type-list", () => {
      $.navigate(`/_hotbars/type/${$(this.form.get()).data("collection")}`, {})
    })

    this.getType()
      .then(this.initForm.bind(this))
      .then(this.refresh.bind(this))
      .then(this.getTypeEntry.bind(this))
      .then(this.updateTable.bind(this))
  }

  initForm() {
    const constrains = buildConstrains(this.type.fields)

    this.form = $(`#${Type.id}`).form(constrains)
    this.entryId = this.form.data().id

    this.modules = new Sidebar(this.type, this.collection, this.entryId)

    this.form.form.on("hb-before-submit", this.handleBeforeSubmit.bind(this))
    this.form.form.on("hb-after-submit", this.handleAfterSubmit.bind(this))
  }

  refresh() {
    this.form.refresh(() => {
      this.form.getLists().forEach((listName) => {
        const group = this.type.fields.find(field => field.name === listName)
        const list = this.form.getList(listName)
        list
          .onRow(this.addRowActions.bind(this))
          .setDefaultContext({ groupId: group.id })
      })
    })
  }

  /* mapGroups(type) {
    this.groups = type.fields
      .filter(field => field.type === "group" && field.behaviour === "list")
      .reduce((ac, field) => {
          ac[field.id] = $(`#${field.name}-group table`)
          .table(null, field.name, (d) => d)
          .onRow(this.addRowActions.bind(this))
          .setDefaultContext({ groupId: field.id})
        return ac
      }, {})
  } */

  updateTable() {
    if (this.entry && this.type) {
      this.type.fields
        .forEach((field) => {
          if (field.type === "group" && field.behaviour === "list") {
            this.form.getList(field.name)
              .setRows(this.entry[field.name])
          }
        })
    }
  }

  addRowActions(row) {
    return {
      ...row,
      actions: [
        {
          type: "_button",
          icon: "edit",
          color: "neutral",
          attr: {
            dispatch: "hb-edit-row",
            typeId: this.collection,
            rowId: row.id,
            groupId: row.context.groupId
          }
        }
      ]
    }
  }

  async getTypeEntry() {
    const response = await $.rest.get(`/_api/${this.collection}/${this.entryId}`)

    if (response) {
      this.entry = response
      return this.entry;
    }
  }

  async getType() {
    const response = await $.rest.get(`/_api/__types?name=${this.collection}`)

    if (response?.items && response?.items.length > 0) {
      this.type = response.items[0]
      return this.type;
    }
  }

  handleDeleteAll(e) {
    const { group: groupId } = e;
    const selected = this.groups[groupId]?.selected()

    if (groupId in this.groups) {
      selected.forEach(sel => this.groups[groupId].remove(sel))
    }
  }

  handleBeforeSubmit(e) {
    const { data } = e.___td

    /* this.form.getLists()
      .forEach((listName) => {
        const group = this.type?.fields
          .find(field => field.name === listName)
        if (group) {
          data[group.name] = this.groups[group.id].rows()
        }
      }) */
  }

  handleAfterSubmit(e) {
    const { fields } = this.type
  }

  async handleOpenGroupForm(e) {
    const { groupid, rowid } = e
    const group = this.type?.fields
      .find(field => field.id === groupid)

    if (!group) {
      console.warn(`Could not find group ${groupid}.`)
      return;
    }

    group.children = group.children.map(field => ({
      ...field,
      columns: parseInt(field.columns, 10),
      order: parseInt(field.order, 10),
      required: field.required === "true",
      listHeader: field.listHeader === "true",
      readOnly: field.readOnly === "true",
      searchable: field.searchable === "true",
    }))

    if (rowid) {
      group.values = this.entry[group.name].find(child => child.id === rowid)
    }

    this.groupForm = new ListGroupModal(group)

    this.groupForm.form.on("hb-submit", (e) => {
      const { data } = e.___td
      if (!data.id) {
        data.id = $.uniqueId(8)
        this.form.getList(group.name).appendRow(data, { compact: true })
        $.dispatch("hb-new-list-group-entry", data)
      } else {
        this.form.getList(group.name).replaceRow(data, { compact: true })
        $.dispatch("hb-updated-list-group-entry", data)
      }
    })
  }
}

$(async () => {
  await $.preloader.preload([
    "_modules/_category",
    "_dropzone-file",
    "_dropzone-img-file",
  ])

  const type = new Type()
})