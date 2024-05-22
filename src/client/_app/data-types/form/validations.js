

export class Validations {

  form;
  list
  el;

  static options = [
    {value: "equal-to", label: "Equal to", allowed: ["text"]},
    {value: "pattern", label: "Pattern", allowed: ["text"]},
    {value: "min", label: "Min", allowed: ["number", "currency", "integer", "float"]},
    {value: "max", label: "Max", allowed: ["number", "currency", "integer", "float"]},
    {value: "min-length", label: "Min length", allowed: ["text", "textarea"]},
    {value: "max-length", label: "Max length", allowed: ["text", "textarea"]},
    {value: "in", label: "In", allowed: ["text", "number", "integer", "float"]},
    {value: "not-in", label: "Not-in", allowed: ["text", "number", "integer", "float"]},
  ]

  init(form, context) {
    this.form = form
    this.el = $('select[name="validate"]', this.form)
    this.list = $("#hb-validations-list")
      .list(
        "_validation-item",
        "_no-validations-found"
      )

    if (Array.isArray(context.values?.constrains)) {
      this.list
        .setItems(context.values.constrains)
        .update()
    }

    $.subscribe("hb-add-validation", this.handleAddValidation.bind(this))
    $.subscribe("hb-remove-validation", this.handleRemoveValidation.bind(this))

    this.listenChanges()

    return context;
  }

  filterOptions(activeType) {
    return Validations.options
      .filter(option => {
        const has = this.list?.all().find(val => val.constrain === option.value)

        if (has) return false;

        if (Array.isArray(option.allowed)) {
          return option.allowed.indexOf(activeType) > -1
        }

        return option.allowed
      })
  }

  listenChanges() {
    this.el.on("change", (e) => {
      $(`*[name^="validate-"]`, this.form).parents("div[data-input-container]").hide()
      $(`*[name="validate-${this.el.val()}"]`, this.form).parents("div[data-input-container]").show()
    })
  }

  handleRemoveValidation(e) {
    this.list.setItems(
      this.list.all()
        .filter(item => item.id !== e.id)
    )

    this.form.trigger("hb-validations-changed", this.list.all())
  }

  handleAddValidation() {
    const values = this.form.data()
    const constrain = values.validate;
    const constrainValue = values["validate-" + constrain]

    this.list.items.push({
      id: $.uniqueId(),
      constrain,
      constrainValue
    })

    this.form.trigger("hb-validations-changed", this.list.all())
  }
}