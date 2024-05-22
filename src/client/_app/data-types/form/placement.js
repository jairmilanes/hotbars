


export class Placement {

  static options = [
    {value: "main", label: "Main"},
    {value: "sidebar", label: "Sidebar"}
  ]

  init(form, context) {
    this.form = form
    this.context = context

    this.context.positions = Placement.options

    this.attachPlacementChange()

    return this.context
  }

  attachPlacementChange() {
    const typesEl = $('select[name="placement"]', this.form)

    typesEl.on("change", (e) => {
      if (e.target.value.trim() === "main") {
        $(`select[name="columns"]`, this.form).prop("disabled", null)
      } else {
        $(`select[name="columns"]`, this.form).prop("disabled", "disabled")
      }
    })
  }
}