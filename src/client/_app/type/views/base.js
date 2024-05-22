export const _s = {
  el: (id) => $(`#${id}`)
}

export class BaseListView {

  baseUrl = "/_hotbars/type"

  collection;

  context = {
    rows: [],
    type: null,
    paging: {
      total: 0,
      pages: 0,
      page: null,
      next: null,
      prev: null
    }
  }

  type

  constructor(id, context) {
    this.context = $.utils.merge(this.context, context)
    console.log("LIST ID", id)
    this.el = _s.el(id)
    this.collection = this.el.data("collection")
  }

  async deleteAll(items) {
    const deleted = []
    for (let i = 0; i < items.length; i++) {
      const item = await this.handleRemove(items[i])
      if (item) deleted.push(items)
    }
    return deleted
  }

  handleOnData(data) {
    data.items = data.items.map(item => {
      const row = {
        id: item.id,
        row: item,
        actions: []
      }

      if (this.context.type.allowEdit){
        row.actions.push(
          { type: "_button", icon: "edit", color: "neutral", attr: { dispatch: "hb-edit-row", typeId: this.collection, rowId: row.row.id } },
          { type: "_button", icon: "visibility", color: "neutral", attr: { dispatch: "hb-view-row", typeId: this.collection, rowId: row.row.id } }
        )
      }

      return row
    })

    return data
  }

  handleOnLoad(e) {}

  async remove(item) {
    try {
      await $.rest.delete(
        `/_api/${this.collection}/${item.id}`
      )
      return item
    } catch(e) {
      console.warn(`Failed to delete record ${item.id}`)
      console.error(e)
    }
  }

  handleEdit(e) {
    $.navigate(`/_hotbars/type/${e.typeid}/${e.rowid}`)
  }

  handleView(e) {
    $.navigate(`/_hotbars/type/${e.typeid}/${e.rowid}/_view`)
  }
}