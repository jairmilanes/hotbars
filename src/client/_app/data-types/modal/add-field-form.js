import { Modal } from "../../base/modal.js";
import { Validations } from "../form/validations.js";
import { Formats } from "../form/formats.js";
import { Autocomplete } from "../form/autocomplete.js";
import { Types } from "../form/types.js";
import { Placement } from "../form/placement.js";
import { mimeTypes } from "../../base/mime-types.js";

const commaSeparatedRx = new RegExp(/^\s*(?:\s*[^,\s]+(?:\s+[^,\s]+)*\s*(?:,\s*\s*[^,\s]+(?:\s+[^,\s]+)*\s*)*)?\s*$/)

const constrains = {
  base: {
    title: {
      presence: { allowEmpty: false },
      type: "string"
    },
    type: {
      presence: { allowEmpty: false },
      type: "string"
    },
    placement: {
      presence: { allowEmpty: false },
      type: "string"
    },
    hint: {
      type: "string"
    },
    defaultValue: {
      type: "string"
    },
  },
  select: {
    "type-select-options": {
      presence: { allowEmpty: false },
      format: {
        pattern: commaSeparatedRx,
        message: "Must be a list of options separated by comma."
      }
    }
  },
  checkbox: {
    "type-checkbox-options": {
      presence: { allowEmpty: false },
      format: {
        pattern: commaSeparatedRx,
        message: "Must be a list of options separated by comma."
      }
    }
  },
  radio: {
    "type-radio-options": {
      presence: { allowEmpty: false },
      format: {
        pattern: commaSeparatedRx,
        message: "Must be a list of options separated by comma."
      }
    }
  },
  date: {
    "type-date-pattern": {
      presence: { allowEmpty: false },
      type: "string"
    },
    "type-date-mask": {
      presence: { allowEmpty: false },
      type: "string"
    }
  },
  upload: {
    "type-upload-max-size": {
      presence: { allowEmpty: false },
    },
    "type-upload-folder": {
      presence: { allowEmpty: false },
      type: "string"
    },
    "type-upload-accept": {
      presence: { allowEmpty: false },
      format: {
        pattern: commaSeparatedRx,
        message: "Must be a list of file extensions separated by comma."
      }
    }
  },
  dropzone: {
    "type-dropzone-max-input": {
      presence: { allowEmpty: false },
      numericality: {
        onlyInteger: true,
        strict: true,
        noStrings: false,
      }
    },
    "type-dropzone-max-size": {
      presence: { allowEmpty: false },
      numericality: {
        onlyInteger: true,
        strict: true,
        noStrings: false,
      }
    }
  }
}

export class AddFieldForm extends Modal {
  form;
  validations;
  formats;

  saveFieldBtn;
  typeEl;

  columns = [
    {value: 3, label: "25%"},
    {value: 6, label: "50%"},
    {value: 9, label: "75%"},
    {value: 12, label: "100%"},
  ]

  field = {
    name: null,
    type: null,
    validations: []
  }

  context = {
    id: "add-field-form",
    collections: [],
    types: [],
    properties: [],
    columns: this.columns,
    positions: Placement.options,
    fieldTypes: Types.options,
    zipFormats: Formats.zip,
    dateFormats: Formats.date,
    phoneFormats: Formats.phone,
    otherFormats: Formats.other,
    validations: Validations.options,
    /* mimeTypes: Object.keys(mimeTypes)
      .reduce((ac, key) => {
        ac[key] = mimeTypes[key].map(item => ({
          label: item.file_extension, value: item.mime_type
        }))
        return ac
      }, {}), */
    mimeTypes: Object.keys(mimeTypes)
      .reduce((ac, key) => ([
        ...ac,
        {
          label: key,
          value: key
        }
      ]), [{ label: "Custom", value: ""}]),
    values: {
      type: "text",
      placement: "main",
      columns: 12
    }
  }

  modal;

  callbacks = {
    "before-submit": null,
    submit: null,
    "after-submit": null,
    closed: null
  }

  constructor(context) {
    super(context)
    this.context = $.mergeById(this.context, context)
    this.validations = new Validations(this.context)
    this.formats = new Formats(this.context)
    this.autocomplete = new Autocomplete(this.context)
    this.types = new Types(this.context)
    this.placement = new Placement(this.context)

    this.compute(context)

    this.custom("_add-field-modal")
  }

  init(modal) {
    this.form = $("#hb-add-field-form")
      .form(constrains.base)
    this.typeEl = $('select[name="type"]', this.form)
    this.context = this.validations.init(this.form, this.context)
    this.context = this.formats.init(this.form, this.context)
    this.context = this.autocomplete.init(this.form, this.context)
    this.context = this.types.init(this.form, this.context)
    this.context = this.placement.init(this.form, this.context)

    this.form
      .updateConstrains(this.constrains())

    this.form.on("hb-before-submit", this.handleBeforeSubmit.bind(this))
    this.form.on("hb-after-submit", this.handleAfterSubmit.bind(this))

    this.form.on("hb-submit", e => this.callback("submit", e))

    this.form.on("hb-validations-changed", () => {
      const values = this.form.data()

      this.compute({ values })

      this.render()
    })

    this.form.on("hb-autocomplete-changed hb-type-changed", (context) => {
      const values = this.form.data()

      this.compute({ ...context, values })

      this.render()
    })

    this.form.on("hb-type-changed", (e) =>
      this.form.updateConstrains(this.constrains())
    )
  }

  constrains() {
    const type = this.typeEl.val()
    const ctrs = $.utils.merge({}, constrains.base, constrains[type] || {})
    return ctrs
  }

  destroy() {
    this.callback("closed", this.context)
  }

  on(eventName, callback) {
    if (eventName in this.callbacks) {
      this.callbacks[eventName] = callback
    }
  }

  callback(eventName, context) {
    if (typeof this.callbacks[eventName] === "function") {
      this.callbacks[eventName](context)
    }
  }

  compute(data = {}) {
    if (!data.id) {
      delete data.id
    }

    const base = $.mergeById(this.context, data)

    if (data.values?.type && base.values[`type-${data.values?.type}-table`]) {
      const autocompleteType = base?.types.find(t => t.name === base.values[`type-${base.values.type}-table`])

      if (autocompleteType) {
        base.properties = autocompleteType.fields.map(field => ({
          label: field.title,
          value: field.name
        })) || []
      }
    }

    this.context = $.mergeById(base, {
      values: {
        columns: parseInt(data?.values?.columns, 10),
        order: parseInt(data?.values?.order || "0", 10),
        type: data?.values?.type || "text",
        constrains: this.validations?.list?.all() || [],
      },
      collections: data?.types?.map(
        type => ({ label: type.title, value: type.name })
      ) || [],
      validations: this.validations?.filterOptions(
        data?.values?.type || "text"
      ) || []
    })
  }

  mapOptions(field) {
    return field[`type-${field.type}-options`]
      ?.split(",")
      .map(option => ({
        label: option,
        value: option
      }))
  }

  mapToPayload(field) {
    const mapped = {
      ...field,
      columns: parseInt(field?.columns || "12", 10),
      order: parseInt(field?.order, 10),
      title: $.utils.titleize(field?.title || ""),
      name: $.utils.camelCase((field?.title || "")?.normalize('NFD').replace(/[\u0300-\u036f]/g, '') || ""),
      defaultValue: field[`type-default-value`] || null,
      options: this.mapOptions(field),
      constrains: this.validations.list.all()
    }

    Object.keys(mapped).forEach(key => {
      if (key.startsWith("validate-")) {
        delete mapped[key]
      }

      if (key.startsWith("type-")) {
        if (!key.startsWith(`type-${field.type}`)) {
          delete mapped[key]
        }
      }
    })

    return mapped;
  }

  handleBeforeSubmit(e) {
    const { data: field } = e.___td

    e.___td.data = this.mapToPayload(field)

    this.callback("before-submit", e.___td.data)
  }

  handleAfterSubmit(e) {
    this.callback("after-submit", e)
    this.close()
  }

  render() {
    // this.destroy()

    const body = this.modal.find("div[data-modal-body]")

    body.render("_add-field-form", this.context)

    this.init()
  }
}