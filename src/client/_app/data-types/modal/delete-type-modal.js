import { Modal } from "../../base/modal.js";

export class DeleteTypeConfirmModal extends Modal {

  context = {
    id: "delete-type-modal"
  }

  constructor(context) {
    super(context)

    this.context = deepmerge(this.context, context)

    this.confirm()
  }

  init() {
    $.dispatch("hb-delete-type", this.context)
  }

  destroy() {
    $.dispatch("hb-delete-type-modal-closed", this.context)
  }
}