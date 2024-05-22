
export class ViewConfig {
  form
  fields

  static listViewTypes = [
    { label: "Table", value: "table" },
    { label: "Post", value: "post" },
    { label: "Grid", value: "grid" },
    { label: "Product grid", value: "product-grid" },
  ]

  static detailViewTypes = [
    { label: "Post", value: "post" },
    { label: "Product", value: "product" },
    { label: "Question", value: "question" }
  ]

  context = {
    listViewTypes: ViewConfig.viewTypes,
    detailViewTypes: ViewConfig.detailViewTypes,
    values: {}
  }

  onChange = () => undefined;

  constructor(form, fields) {
    this.form = form
    this.fields = fields

    this.listenChanged("listView", "view")
    this.listenChanged("detailView", "detail")
    initTabs()

    const tabs = FlowbiteInstances.getInstance('Tabs', 'hbs-view-config-content-tabs');

    tabs.updateOnShow((inst, tab) => {
      this.form.trigger("hb-tab-changed", tab)
    })
  }

  onFieldChanged(callback) {
    if (typeof callback === "function") {
      this.onChange = callback
    }
  }

  listenChanged(name, type) {
    $(`select[name="${name}"]`, this.form).on("change", (e) => {
      this.context.values[name] = e.target.value
      $(`div[id$="-view-settings"]`, this.form).hide()
      $(`div#${e.target.value}-${type}-settings`, this.form).show()

      this.form.trigger("hb-view-type-changed", this.context)

      if (e.target.value === "table") {
        this.attachTableViewHeaderChange()
      }
    })
  }

  attachTableViewHeaderChange() {
    const list = $('div[data-headers="view-table-add-header"]')
      .list(
        $("#view-table-row").text()
      )

    const fields = this.fields.all()

    fields.forEach((field) => {
      if (field.listHeader === "true") {
        list.appendItem(field)
      }
    })

    $(`button#view-table-add-column`).on("click", (e) => {
      const header = $('select[name="view-table-add-header"]').val()

      let field;
      if (header?.indexOf(".") > -1) {
        const column = header.split(".")[1]

        field = this.fields.all().find(f => f.name === header);
      } else {
        field = this.fields.all().find(f => f.name === header);
      }

      if (field) {
        field.listHeader = true;

        this.fields.replaceItem(field)

        list.appendItem(field)
      }
    })
  }
}