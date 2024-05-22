import { Modal } from "../../base/modal.js"

export class MoveFormModal extends Modal {

  form;
  modal;
  context = {
    id: "add-group-modal"
  }

  options = [
    { value: "before", label: "Before" },
    { value: "after", label: "After" },
  ]

  constructor(context) {
    super(context)

    this.context = deepmerge(
      this.context, {
      ...context,
      options: this.options,
      items: (context?.items || []).map((item) => ({
        label: item.title,
        value: item.id
      }))
    })

    this.custom("_move-field-modal")
  }

  init() {
    this.form = $("#hb-move-field-form").form({})
    this.form.form.on("hb-before-submit", this.handleBeforeSubmit.bind(this))
    this.form.form.on("hb-after-submit", this.handleAfterSubmit.bind(this))
  }

  handleBeforeSubmit(e) {
    const { id, data } = e.___td

  }

  handleAfterSubmit() {
    this.close()
  }
}
