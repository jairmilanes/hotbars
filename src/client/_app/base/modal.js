

export class Modal {
  modal

  context = {
    id: "default-modal"
  }

  constructor(context) {
    this.context = {
      ...this.context,
      ...context
    }

    // $.subscribe(`hb-close-${this.context.id}`)
  }

  custom(template) {
    this.modal = $.modals.custom(
      template,
      this.context,
      this.modalCallback.bind(this)
    )
  }

  confirm() {
    this.modal = $.modals.confirm(
      this.context,
      this.modalCallback.bind(this)
    )
  }

  alert() {
    this.modal = $.modals.alert(
      this.context,
      this.modalCallback.bind(this)
    )
  }

  init() {
    return;
  }

  destroy() {
    return;
  }

  close() {
    this.modal.close()
  }

  modalCallback(action, modal) {
    if (action === "opened") {
      this.init(modal)
    }

    if (action === "close") {
      $.unsubscribe(`hb-close-${this.context.id}`)

      this.destroy()
    }
  }
}