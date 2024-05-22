import { BaseModule } from "./base.js"

export class PublishModule extends BaseModule {
  collection = "__categories"
  form

  constructor(type) {
    super($("#hb-publish-module"), "_modules/_publish");
    if (type?.trackStatus) {
      this.form = $("#hb-publish-form").form({})
      this.form.on("hb-before-submit", this.handleBeforeSubmit.bind(this))
    }
  }

  handleBeforeSubmit(e) {
    const data = e.___td.data
    e.___td.data = {
      __meta: { ...data }
    }
  }
}
