import { BaseListView } from "./base.js";


export class TableView extends BaseListView {

  table

  constructor(id, context) {
    super(id, context)

    this.table = $(`#${id}`)
      .table(null, this.handleOnLoad.bind(this))

    $.subscribe("hb-remove-row", this.handleRemove.bind(this))
    $.subscribe("hb-edit-row", this.handleEdit.bind(this))
    $.subscribe("hb-view-row", this.handleView.bind(this))
  }

  destroy() {
    $.unsubscribe("hb-remove-row hb-edit-row")
  }

  async handleRemove(e) {
    if (this.list.has(e.rowid)) {
      await this.remove(this.list.getItem(e.rowid))
      await this.table.load()
    }
  }

  handleOnLoad(data) {
    const newData = super.handleOnData(data)

    newData.items = data.items.map(item => ({
      ...item.row,
      actions: item.actions
    }))

    return newData
  }
}