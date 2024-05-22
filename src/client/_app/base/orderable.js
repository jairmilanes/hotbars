import { MoveFormModal } from "../data-types/modal/move-field-form.js";


export const orderable = (Base) => {
  return class Orderable extends Base {

    list;
    moveForm;

    constructor() {
      super()
      $.subscribe("hb-init-field-move", this.handleOpenMoveModal.bind(this))
      $.subscribe("hb-move-field-up", this.handleMoveFieldUp.bind(this))
      $.subscribe("hb-move-field-down", this.handleMoveFieldDown.bind(this))
    }

    handleOpenMoveModal() {
      if (this.moveForm) {
        return;
      }

      this.moveForm = new MoveFormModal({
        items: this.list.all(),
        values: {}
      })

      this.moveForm.form.on("hb-closed", (e) => {
        this.moveForm = null
      })

      this.moveForm.form.on("hb-submit", (e) => {
        const { data } = e.___td
        this.handleOrderChangedAll(data)
        this.moveForm = null
      })
    }

    sortAscending(items) {
      const by = "order"
      return items.sort(
        (a, b) => (a[by] > b[by]) ? 1 : ((b[by] > a[by]) ? -1 : 0)
      );
    }

    getOrderOptions(fields) {
      return (fields || this.list.all() || [])
        .filter(field => field.name !== "id")
        .map((field, i) => ({
          label: i + 1,
          value: i + 1
        }))
    }

    fixOrder() {
      const items = this.list
        .sort("order", "asc")
        .all()
        .map((item, i) => {
          if (item.name !== "id") {
            item.order = i
          }
          return item
        })
      this.list
        .setItems(items)
        .sort("order", "asc")
        .update({ orderOptions: this.getOrderOptions()})
    }

    reArrangeItems(selected, direction, targetIndex) {
      const by = "order"
      const items = selected.sort(
        (a, b) => (a[by] > b[by]) ? 1 : ((b[by] > a[by]) ? -1 : 0)
      );

      selected.forEach((item, i) => {
        if (direction === "before") {
          this.changedOrder(item, (targetIndex - (i + 1)))
        } else {
          this.changedOrder(item, (targetIndex + (i + 1)))
        }
      })

      this.list
        .sort("order", "asc")
        .update({ orderOptions: this.getOrderOptions() })

      $.dispatch(this.list)
    }

    handleMoveFieldUp(e) {
      const list = (e.group ? this.groups[e.group] : this.list)
      const item = list.getItem(e.id)

      if (!item) {
        return;
      }

      const previous = list.previous(item.id)

      // Move up into a group
      if (!e.group && previous.type === "group") {
        const group = this.groups[previous.name]

        item.groupName = previous.name

        item.order = group.last().order + 1

        list.removeItem(item.id)
        group.appendItem(item)

        $.dispatch(group.lastEl())
      }

      // Moving up out of a group
      else if (e.group && (item.order - 1) < 0) {
        const allItems = this.all()
        const groupIndex = this.all().findIndex(item => item.name == e.group)

        list.removeItem(item.id)

        delete item.groupName;

        item.order = allItems[groupIndex].order

        this.list
          .appendBefore(
            groupIndex,
            item
          )
          .fixOrder()
          .update()

        this.mapGroups()

        $.dispatch(this.list)
      }

      // Moving anything else
      else {
        list
          .changedOrder(item, item.order - 1)
          .update({ orderOptions: this.getOrderOptions() })

        // $.dispatch(list)
      }
    }

    handleMoveFieldDown(e) {
      const list = (e.group ? this.groups[e.group] : this.list)
      const item = list.getItem(e.id)

      if (!item) {
        return;
      }

      const next = list.next(item.id)

      // Move down into a group
      if (!e.group && next.type === "group") {
        const group = this.groups[next.name]

        list.removeItem(item.id)

        item.groupName = next.name
        item.order = 0

        this.groups[next.name]
          .prependItem(item)
          .fixOrder()
          .update()

        $.dispatch(this.groups[next.name])
      }

      // Moving down out of a group
      else if (e.group && (item.order + 1) > (list.all().length - 1)) {
        const parentItems = this.all()
        const groupIndex = parentItems.findIndex(item => item.name == e.group)

        if (groupIndex < 0) return;

        parentItems[groupIndex].children =
          parentItems[groupIndex].children.filter(it => it.id !== item.id)

        delete item.groupName

        item.order = parentItems[groupIndex].order + 1

        parentItems.splice(groupIndex + 1, 0, item)

        this.list
          .setItems(parentItems)
          .fixOrder()
          .update()

        this.mapGroups()

        $.dispatch(this.list)
      }

      // Moving anything else
      else {
        list
          .changedOrder(item, item.order + 1)
          .update({ orderOptions: this.getOrderOptions() })

        // $.dispatch(list)
      }
    }
  }
}