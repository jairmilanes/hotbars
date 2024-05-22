


export class Autocomplete {

  form;
  context;

  init(form, context) {
    this.form = form;
    this.context = context;

    this.attachAutocompleteChange()

    return this.context;
  }

  attachAutocompleteChange() {
    this.form.on("hb-form-changed", (e) => {
      const { name, value } = e.___td
      if (/type-.*-table/g.test(name)) {
        const type = this.context?.types.find(type => type.name == value)

        if (type) {
          const data = this.form.data()
          const fields = type.fields.map(field => field.name)

          this.context.values = {
            ...this.context.values,
            ...data,
            [`type-${e.name}-table`]: value,
            [`type-${e.name}-prop`]: fields[0]
          }

          this.context.properties = fields.map(fieldName => ({
            label: $.utils.titleize(fieldName),
            value: fieldName
          }))

          this.form.trigger("hb-autocomplete-changed", this.context)
        }
      }
    })
  }
}