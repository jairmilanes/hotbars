export class ListGroupModal {
  modal;
  context = {
    id: "_list-group-form-modal"
  }
  form;

  constructor(context) {
    this.context = {
      ...this.context,
      ...context
    }

    $.subscribe("hb-close-list-group-form", this.close.bind(this))

    this.modal = $.modals.custom(
      "_list-group-form-modal",
      this.context,
      this.modalCallback.bind(this)
    )

    this.form.form.on("hb-before-submit", this.handleBeforeSubmit.bind(this))
    this.form.form.on("hb-after-submit", this.handleAfterSubmit.bind(this))
  }

  destroy() {
    $.unsubscribe("hb-close-list-group-form")
  }

  close() {
    this.modal.close()
  }

  modalCallback(action, modal) {
    if (action === "opened") {
      this.form = $("#hb-list-group-form").form({})
    }

    if (action === "close") {
      this.destroy()
      this.form.trigger("hb-closed", this.context)
    }
  }

  handleBeforeSubmit(e) {
    const { data } = e.___td
  }

  handleAfterSubmit() {
    this.close()
    // $.dispatch("hb-add-to-list-group")
  }
}