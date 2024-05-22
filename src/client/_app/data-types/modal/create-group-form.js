import { Modal } from "../../base/modal.js";

export class CreateGroupModal extends Modal {
  form;

  context = {
    id: "create-group-modal"
  }

  constructor(context) {
    super(context)

    this.context = deepmerge(this.context, context)

    this.custom("_create-group-modal")
  }

  init() {
    this.form = $("#hb-create-group-form").form({})
    this.form.on("hb-before-submit", this.handleBeforeSubmit.bind(this))
    this.form.on("hb-after-submit", this.handleAfterSubmit.bind(this))
  }

  destroy() {
    this.form.trigger("hb-closed", this.context)
  }

  handleBeforeSubmit(e) {
    const { data } = e.___td

    if (!data.id.trim()) {
      delete data.id
    }

    data.title = $.utils.titleize(data.title || "")
    data.name = $.utils.camelCase(data.title || "")
  }

  handleAfterSubmit() {
    this.close()
  }
}