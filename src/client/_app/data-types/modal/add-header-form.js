import { Modal } from "../../base/modal.js"

export class AddHeaderForm extends Modal {
  form;

  context = {
    id: "add-header-form"
  }

  constructor(context) {
    super(context)

    this.context = deepmerge(this.context, context)

    this.custom("_add-header-modal")
  }

  init() {
    this.form = $("#hb-add-header-form").form({})
    this.form.on("hb-before-submit", this.handleBeforeSubmit.bind(this))
    this.form.on("hb-after-submit", this.handleAfterSubmit.bind(this))
  }

  destroy() {
    this.form.trigger("hb-closed", this.context)
  }

  handleBeforeSubmit(e) {
    const { data } = e.___td
    // const group = this.form.data()
    if (!data.id.trim()) {
      delete data.id
    }

    data.title = $.utils.titleize(data.title || "")
    data.name = $.utils.camelCase(data.title || "")
    // this.form.trigger("hb-submit", data)
  }

  handleAfterSubmit() {
    this.close()
  }
}