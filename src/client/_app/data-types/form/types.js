import { mimeTypes } from "../../base/mime-types.js"

export class Types {
  context;

  static options = [
    {value: "text", label: "Text"},
    {value: "alphanumeric", label: "Alphanumeric"},
    {value: "alpha", label: "Alpha"},
    {value: "autocomplete", label: "Autocomplete"},
    {value: "search", label: "Search"},
    {value: "credit-card", label: "Credit card"},
    {value: "textarea", label: "Textarea"},
    {value: "currency", label: "Currency"},
    {value: "float", label: "Float"},
    {value: "integer", label: "Integer"},
    {value: "zip", label: "Zip Code"},
    {value: "email", label: "Email"},
    {value: "phonenumber", label: "Phone number"},
    {value: "cpf", label: "CPF"},
    {value: "cnpj", label: "CNPJ"},
    {value: "cpf-cnpj", label: "CPF & CNPJ"},
    {value: "pattern", label: "Pattern"},
    {value: "date", label: "Date"},
    {value: "url", label: "Url"},
    {value: "time", label: "Time"},
    {value: "select", label: "Select"},
    {value: "checkbox", label: "Checkbox"},
    {value: "radio", label: "Radio"},
    {value: "rich", label: "Rich Editor"},
    {value: "toggle", label: "Toggle"},
    {value: "dropzone", label: "Dropzone"},
    {value: "upload", label: "Upload"},
    {value: "user", label: "User"},
    {value: "one-to-one", label: "One to one"},
    {value: "one-to-many", label: "One to many"},
  ]

  init(form, context) {
    this.form = form
    this.context = context

    this.context.fieldTypes = Types.options

    this.attachTypeChange()
    this.attachMimeTypeChange("upload")
    this.attachMimeTypeChange("dropzone")

    return this.context
  }

  toggleOptions(typesEl) {
    $(`*[name^="type-"]`, this.form).parents("div[data-input-container]").hide()
    $(`*[name^="type-${typesEl.val()}-"]`, this.form).parents("div[data-input-container]").show()
  }

  attachTypeChange() {
    const typesEl = $('select[name="type"]', this.form)

    typesEl.on("change", (e) => {
      this.form.trigger("hb-type-changed", this.context)

      this.toggleOptions(typesEl)
    })
  }

  attachMimeTypeChange(name) {
    $(`select[name=type-${name}-accept-type]`)
      .on("change", (e) => {
        $(`input[name=type-${name}-accept]`).val(
          mimeTypes[e.target.value]
            .map(item => item.file_extension)
            .join(",")
        )
        this.form.updateValidity()
      })
  }
}