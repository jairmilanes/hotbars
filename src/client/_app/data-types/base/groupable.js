import { CreateGroupModal } from "../modal/create-group-form.js";

/**
 * This class depends on the Selectable, Orderable base clases to work.
 *
 * @param Base
 * @returns Groupable
 * @requires Selectable, Orderable
 */
export const groupable = (Base) => {
  return class Groupable extends Base {

    groups = {}
    createGroupForm;

    constructor() {
      super();
      $.subscribe("hb-group-fields", this.handleGroupFields.bind(this))
    }

    handleGroupFields(e) {
      const type = e.type
      const withSelected = e.selected
      this.createGroupForm = new CreateGroupModal({
        type: e.type
      })

      this.createGroupForm.form.on("hb-closed", (e) => {
        this.createGroupForm = null;
      })

      this.createGroupForm.form.on("hb-submit", (e) => {
        const { data: group } = e.___td

        const allItems = this.all()
        const selected = this.sortAscending(this.list.getSelected())

        const firstIndex = () => {
          return allItems
            .findIndex((it) => {
              if (selected.length) return it == selected[0].id
              return it == allItems[allItems.length - 1].id
            })
        }

        group.order = selected.length ? selected[0].order : allItems[allItems.length - 1].order

        if (withSelected) {
          const items = (selected || [])
            .map((item, indx) => {
              item.groupName = group.name
              item.order = indx

              const i = allItems.findIndex(it => it.id == item.id)

              allItems.splice(i, 1)

              return item;
            })

          /* items.unshift({
            "id": "k1wJMN1M",
            "name": "id",
            "order": 14,
            "title": "Id",
            "type": "hidden",
            "placement": "main",
            "columns": 12,
            "defaultValue": null,
            "constrains": [],
            "required": false,
            "listHeader": false,
            "readOnly": false,
            "searchable": false
          }) */
          group.children = items

          this.selected = {}
        } else {
          group.children = []
        }

        if (type === "list") {
          group.behaviour = "list"
        }

        allItems.splice(firstIndex(), 0, group)

        this.list
          .setItems(allItems)
          .fixOrder()
          .update()

        this.mapGroups()

        // this.reArrangeItems(items, "after", firstIndex)
        this.createGroupForm = null;
        this.listActions.hide()
        this.listMenu.show()
        // $.dispatch(this.list)
      })
    }
  }
}